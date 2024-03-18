import AWS from "aws-sdk";
import { exec } from "child_process";
import winston from "winston";

const logger = winston.createLogger({
  level: "verbose",
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),
  transports: [new winston.transports.Console()],
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
    verbose: 4,
  },
});

winston.addColors({
  error: "red",
  warn: "yellow",
  info: "green",
  debug: "cyan",
  verbose: "gray",
});

const RUN_NAME = `d424-${new Date().toISOString().replace(/[:.]/g, "-")}`;

const defaults = {
  ACCESS_KEY_ID: false, // Replace with your own AWS access key ID
  ACCESS_KEY_SECRET: false, // Replace with your own AWS access key secret
  REGION: "us-east-2",
  EC2_INSTANCE_TYPE: "t2.medium",
  EC2_AMI: "ami-0afeafbbe8cecce6c",
  EC2_STORAGE: "20",
  EC2_VOLUME_TYPE: "gp3",
  EC2_KEY_NAME: "d424",
  EC2_KEY_PATH: "/Users/aaron/Downloads/d424.pem", // Replace with your own key path
  RDS_DB_INSTANCE_CLASS: "db.t4g.micro",
  RDS_DB_NAME: "d424",
  RDS_USERNAME: "postgres",
  RDS_PASSWORD: "1SomewhatSecureAndSimple987", // Replace with new DB password
  RDS_STORAGE: "20",
  RDS_VOLUME_TYPE: "gp3",
  GITLAB_USERNAME: "aarondancer", // Replace with your own GitLab username
  GITLAB_PASSWORD: null, // Replace with your own GitLab PAT
  VPC_BLOCK: "10.42.0.0/16",
  VPC_SUBNET_BLOCK: "10.42.1.0/24",
  EC2_SECURITY_GROUP_NAME: `ec2-security-group-${RUN_NAME}`,
  RDS_SECURITY_GROUP_NAME: `rds-security-group-${RUN_NAME}`,
} as const;

const getVar = (key: keyof typeof defaults): string => {
  const value = process.env[key] || defaults[key];
  if (!value && value !== false) {
    throw new Error(`Missing env var ${key}`);
  }
  return value as string;
};

AWS.config.update({
  region: getVar("REGION"),
  ...(getVar("ACCESS_KEY_ID")
    ? {
        accessKeyId: getVar("ACCESS_KEY_ID"),
        secretAccessKey: getVar("ACCESS_KEY_SECRET"),
      }
    : null),
});

const ec2 = new AWS.EC2({ apiVersion: "2016-11-15" });
const rds = new AWS.RDS({ apiVersion: "2014-10-31" });

(async function () {
  // Get default VPC

  const vpcs = await ec2.describeVpcs().promise();
  const vpc = vpcs.Vpcs?.find((vpc) => vpc.IsDefault);

  if (!vpc?.VpcId) {
    throw new Error("No default VPC");
  }
  logger.debug("Default VPC found");

  // Create security group for RDS
  const rdssg = await ec2
    .createSecurityGroup({
      GroupName: getVar("RDS_SECURITY_GROUP_NAME"),
      Description: `RDS security group ${RUN_NAME}`,
      VpcId: vpc.VpcId,
    })
    .promise();

  if (!rdssg.GroupId) {
    throw new Error("No RDS security group name");
  }

  // Create security group for EC2
  const ec2sg = await ec2
    .createSecurityGroup({
      Description: `EC2 security group ${RUN_NAME}`,
      GroupName: getVar("EC2_SECURITY_GROUP_NAME"),
      VpcId: vpc.VpcId,
    })
    .promise();
  logger.info("EC2 security group created");

  if (!ec2sg.GroupId) {
    throw new Error("No EC2 security group ID");
  }

  // Allow ingress for EC2 security group
  await ec2
    .authorizeSecurityGroupIngress({
      GroupId: ec2sg.GroupId,
      IpPermissions: [
        {
          IpProtocol: "tcp",
          FromPort: 443,
          ToPort: 443,
          IpRanges: [{ CidrIp: "0.0.0.0/0" }], // Allow all incoming traffic on port 443
        },
        {
          IpProtocol: "tcp",
          FromPort: 80,
          ToPort: 80,
          IpRanges: [{ CidrIp: "0.0.0.0/0" }], // Allow all incoming traffic on port 80
        },
        {
          IpProtocol: "tcp",
          FromPort: 22,
          ToPort: 22,
          IpRanges: [{ CidrIp: `0.0.0.0/0` }], // Allow incoming traffic from currnet IP on port 22
        },
      ],
    })
    .promise();

  // Allow egress for EC2 security group
  await ec2
    .authorizeSecurityGroupEgress({
      GroupId: ec2sg.GroupId,
      IpPermissions: [
        {
          IpProtocol: "tcp",
          FromPort: 443, // for internet
          ToPort: 443,
          IpRanges: [{ CidrIp: "0.0.0.0/0" }],
        },
        {
          IpProtocol: "tcp",
          FromPort: 80, // for internet
          ToPort: 80,
          IpRanges: [{ CidrIp: "0.0.0.0/0" }],
        },
        {
          IpProtocol: "tcp",
          FromPort: 5432, // for RDS
          ToPort: 5432,
          IpRanges: [{ CidrIp: "0.0.0.0/0" }],
        },
      ],
    })
    .promise();

  // Allow ingress for RDS security group
  await ec2
    .authorizeSecurityGroupIngress({
      GroupId: rdssg.GroupId,
      IpPermissions: [
        {
          IpProtocol: "tcp",
          FromPort: 5432,
          ToPort: 5432,
          IpRanges: [{ CidrIp: "0.0.0.0/0" }],
        },
      ],
    })
    .promise();

  // Create RDS instance
  const rdsInstance = await rds
    .createDBInstance({
      DBInstanceIdentifier: `rds-instance-${RUN_NAME}`,
      AllocatedStorage: parseInt(getVar("RDS_STORAGE"), 10),
      DBInstanceClass: getVar("RDS_DB_INSTANCE_CLASS"),
      Engine: "postgres",
      MasterUsername: getVar("RDS_USERNAME"),
      MasterUserPassword: getVar("RDS_PASSWORD"),
      VpcSecurityGroupIds: [rdssg.GroupId],
      AvailabilityZone: "us-east-2a",
      DBName: getVar("RDS_DB_NAME"),
      StorageType: getVar("RDS_VOLUME_TYPE"),
    })
    .promise();
  logger.debug("RDS instance creation initiated");

  if (!rdsInstance.DBInstance?.DBInstanceIdentifier) {
    throw new Error("No RDS instance ID");
  }

  logger.debug("Creating EC2 instance...");
  const ec2data = await ec2
    .runInstances({
      ImageId: getVar("EC2_AMI"),
      InstanceType: getVar("EC2_INSTANCE_TYPE"),
      KeyName: getVar("EC2_KEY_NAME"),
      MinCount: 1,
      MaxCount: 1,
    })
    .promise();

  const instanceId = ec2data.Instances?.[0].InstanceId;

  if (!instanceId) {
    throw new Error("No instance ID");
  }
  logger.info("EC2 instance created");

  // Add tags to EC2 instance
  const tagParams = {
    Resources: [instanceId],
    Tags: [
      {
        Key: "Name",
        Value: RUN_NAME,
      },
    ],
  };

  await ec2.createTags(tagParams).promise();

  // Add security group to EC2 instance
  await ec2
    .modifyInstanceAttribute({
      InstanceId: instanceId,
      Groups: [ec2sg.GroupId] as string[],
    })
    .promise();

  logger.debug("Waiting for instance to start...");
  await ec2.waitFor("instanceRunning", { InstanceIds: [instanceId] }).promise();
  logger.info("Instance started");

  // Get instance data once it's running
  const ec2InstanceData = await ec2
    .describeInstances({ InstanceIds: [instanceId] })
    .promise();

  const ec2ip =
    ec2InstanceData.Reservations?.[0].Instances?.[0].PublicIpAddress;
  const ec2publicdns =
    ec2InstanceData.Reservations?.[0].Instances?.[0].PublicDnsName;

  if (!ec2ip) {
    throw new Error("No EC2 IP");
  }

  if (!ec2publicdns) {
    throw new Error("No EC2 public DNS");
  }

  logger.debug(`Connecting to EC2 instance... ${ec2publicdns}`);

  function isSshReady() {
    return new Promise((res, rej) => {
      exec(
        `ssh -o StrictHostKeyChecking=no -i '${getVar(
          "EC2_KEY_PATH"
        )}' ubuntu@${ec2publicdns} -tt 'echo "SSH is ready"'`,
        (error, stdout, stderr) => {
          if (stdout.includes("SSH is ready")) {
            res(stdout);
            return;
          }
          if (error) {
            rej(error);
            return;
          }
          if (stderr) {
            rej(stderr);
            return;
          }
          res(stdout);
        }
      );
    });
  }

  // Retry SSH connection until it's ready
  function waitForSshReady(maxTime: number) {
    return new Promise<void>((res, rej) => {
      let tries = 0;
      const interval = setInterval(async () => {
        try {
          await isSshReady();
          clearInterval(interval);
          res();
        } catch (e) {
          tries++;
          if (tries > maxTime) {
            rej(e);
          }
        }
      }, 1000);
    });
  }

  async function sendCommands(commands: string | string[]) {
    if (Array.isArray(commands)) {
      for (const command of commands) {
        await sendCommands(command);
      }
      return;
    }
    return new Promise((res, rej) => {
      logger.debug(`Sending command: ${commands}`);
      logger.verbose(
        `ssh -o StrictHostKeyChecking=no -i '${getVar(
          "EC2_KEY_PATH"
        )}' ubuntu@${ec2publicdns} -tt '${commands}'`
      );
      exec(
        `ssh -o StrictHostKeyChecking=no -i '${getVar(
          "EC2_KEY_PATH"
        )}' ubuntu@${ec2publicdns} -tt '${commands}'`,
        (error, stdout, stderr) => {
          if (error) {
            logger.error(`error: ${error.message}`);
            rej(error);
            return;
          }
          if (stderr && !stderr.includes("compute.amazonaws.com closed")) {
            logger.error(`stderr: ${stderr}`);
            logger.verbose(`stdout: ${stdout}`);
            rej(stderr);
            return;
          }
          logger.verbose(`stdout: ${stdout}`);
          res(stdout);
        }
      );
    });
  }

  // Wait for SSH to be ready
  await waitForSshReady(120);
  logger.debug("SSH is ready");
  // Install node.js
  await sendCommands([
    "sudo apt-get update",
    "sudo curl -SLO https://deb.nodesource.com/nsolid_setup_deb.sh",
    "sudo chmod 500 nsolid_setup_deb.sh",
    "sudo ./nsolid_setup_deb.sh 20",
    "sudo apt-get install -y ca-certificates curl gnupg nodejs postgresql",
    "sudo npm install -g yarn",
  ]);
  logger.info("Installed node");
  // Install Docker
  await sendCommands([
    "sudo apt-get update",
    "sudo install -m 0755 -d /etc/apt/keyrings",
    "curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --yes --dearmor -o /etc/apt/keyrings/docker.gpg",
    "sudo chmod a+r /etc/apt/keyrings/docker.gpg",
    'echo "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null',
    "sudo apt-get update",
    "sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin",
  ]);
  logger.info("Installed docker");

  logger.debug("Waiting for RDS instance to be available...");
  await rds
    .waitFor("dBInstanceAvailable", {
      DBInstanceIdentifier: rdsInstance.DBInstance.DBInstanceIdentifier,
    })
    .promise();
  logger.info("RDS instance available");

  const rdsInstanceData = await rds
    .describeDBInstances({
      DBInstanceIdentifier: rdsInstance.DBInstance.DBInstanceIdentifier,
    })
    .promise();

  const rdsEndpoint = rdsInstanceData.DBInstances?.[0].Endpoint?.Address;

  if (!rdsEndpoint) {
    throw new Error("No RDS endpoint");
  }
  logger.debug(`RDS endpoint found ${rdsEndpoint}`);

  // Clone repo and update env vars
  await sendCommands([
    `git clone https://${getVar("GITLAB_USERNAME")}:${getVar(
      "GITLAB_PASSWORD"
    )}@gitlab.com/wgu-gitlab-environment/student-repos/aarondancer/d424-software-engineering-capstone.git && cd d424-software-engineering-capstone && git checkout working_branch`,
    `sed -i \
      -e "s/DB_HOST=.*/DB_HOST=${rdsEndpoint}/" \
      -e "s/DB_USERNAME=.*/DB_USERNAME=${getVar("RDS_USERNAME")}/" \
      -e "s/DB_PASSWORD=.*/DB_PASSWORD=${getVar("RDS_PASSWORD")}/" \
      -e "s/DB_DATABASE=.*/DB_DATABASE=${getVar("RDS_DB_NAME")}/" \
      -e "s/NODE_ENV=.*/NODE_ENV=production/" \
      -e "s/ENABLE_DOCUMENTATION=.*/ENABLE_DOCUMENTATION=false/" \
      ~/d424-software-engineering-capstone/.env`,
    "cp ~/d424-software-engineering-capstone/.env ~/d424-software-engineering-capstone/backend/.env",
  ]);
  logger.info("Cloned repo and updated env vars");

  // Run migrations
  await sendCommands([
    "cd ~/d424-software-engineering-capstone/backend && yarn && yarn migration:run",
  ]);
  logger.info("Ran migrations");

  // Pull and run docker images
  await sendCommands([
    "cd ~/d424-software-engineering-capstone/ && sudo ./run-prod.sh",
  ]);

  logger.debug("Closed SSH connection");

  logger.info(`SUCCESS! App running at http://${ec2ip}`);

  // Optional: Cleanup, delete all resources
  if (process.env["CLEANUP"]) {
    await rds
      .deleteDBInstance({
        DBInstanceIdentifier: rdsInstance.DBInstance.DBInstanceIdentifier,
        SkipFinalSnapshot: true,
        DeleteAutomatedBackups: true,
      })
      .promise();
    await ec2.terminateInstances({ InstanceIds: [instanceId] }).promise();
    await ec2.deleteSecurityGroup({ GroupId: ec2sg.GroupId }).promise();
    await ec2.deleteSecurityGroup({ GroupId: rdssg.GroupId }).promise();
  }

  process.exit(0);
})();
