"use client";

import * as React from "react";

import { UpdateIcon } from "@radix-ui/react-icons";

import { useLoginMutation, useRegisterMutation } from "@/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form, SimpleFormField, useZodForm, z } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/utils";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

const SPINNER_ELEMENT = <UpdateIcon className="mr-2 h-4 w-4 animate-spin" />;

const emailSchema = z
  .string()
  .email({
    message: "Email must be a valid email.",
  })
  .regex(/@fpi\.test$/, {
    message: "Email must be a valid FPI email.",
  })
  .min(4, {
    message: "Email must be at least 4 characters.",
  });

const loginFormSchema = z.object({
  email: emailSchema,
  password: z.string().min(8).max(32),
});

const registerFormSchema = z
  .object({
    firstName: z.string().min(2).max(32),
    lastName: z.string().min(2).max(32),
    email: emailSchema,
    password: z
      .string()
      .min(8)
      .max(32)
      .refine(
        (password) => {
          // Ensure the password contains at least one uppercase letter, one lowercase letter, one digit, and one special character
          const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
          return passwordRegex.test(password);
        },
        {
          message:
            "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character and be at least 8 characters long.",
        }
      ),
    confirmPassword: z.string().min(8).max(100),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"]
  });

function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  "use client";
  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();

  const isLoading = loginMutation.isLoading || registerMutation.isLoading;

  const loginForm = useZodForm({
    schema: loginFormSchema,
    defaultValues:
      process.env.NODE_ENV === "development"
        ? {
            email: "staff@fpi.test",
            password: "password",
          }
        : {
            email: "",
            password: "",
          },
  });

  const onSubmitLogin = loginForm.handleSubmit((data, e) => {
    e?.preventDefault();
    loginMutation.mutate(data);
  });

  const registerForm = useZodForm({
    schema: registerFormSchema,
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmitRegister = registerForm.handleSubmit((data) => {
    registerMutation.mutate(data);
  });

  return (
    <div className={cn("grid gap-6", className)}>
      <h1 className="text-2xl">{"Welcome, let's get started."}</h1>
      <Tabs defaultValue="login" className="w-full md:w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger data-testid="tab-login" value="login">Login</TabsTrigger>
          <TabsTrigger data-testid="tab-register" value="register">Register</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Form {...loginForm}>
            <form onSubmit={onSubmitLogin}>
              <Card>
                <CardHeader>
                  <CardTitle>Login</CardTitle>
                  <CardDescription>
                    Authenticate with your FPI email and password.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="space-y-1">
                    <SimpleFormField form={loginForm} name="email">
                      <Input
                        id="login-email"
                        data-testid="login-email"
                        type="email"
                        placeholder="name@fpi.test"
                        autoFocus
                        autoCapitalize="none"
                        autoComplete="email"
                        autoCorrect="off"
                        disabled={isLoading}
                      />
                    </SimpleFormField>
                  </div>
                  <div className="space-y-1">
                    <SimpleFormField form={loginForm} name="password">
                      <Input
                        data-testid="login-password"
                        type="password"
                        placeholder="Password"
                        autoCapitalize="none"
                        autoComplete="password"
                        autoCorrect="off"
                        disabled={isLoading}
                      />
                    </SimpleFormField>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    data-testid="login-submit"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading && SPINNER_ELEMENT}Submit
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </TabsContent>
        <TabsContent value="register">
          <Form {...registerForm}>
            <form onSubmit={onSubmitRegister}>
              <Card>
                <CardHeader>
                  <CardTitle>Sign Up</CardTitle>
                  <CardDescription>
                    Register with your FPI email and password.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="space-y-1">
                    <SimpleFormField form={registerForm} name="firstName">
                      <Input
                        data-testid="register-firstName"
                        type="text"
                        placeholder="First name"
                        disabled={isLoading}
                      />
                    </SimpleFormField>
                  </div>
                  <div className="space-y-1">
                    <SimpleFormField form={registerForm} name="lastName">
                      <Input
                        data-testid="register-lastName"
                        type="text"
                        placeholder="Last name"
                        disabled={isLoading}
                      />
                    </SimpleFormField>
                  </div>
                  <div className="space-y-1">
                    <SimpleFormField form={registerForm} name="email">
                      <Input
                        data-testid="register-email"
                        type="email"
                        placeholder="name@fpi.test"
                        autoCapitalize="none"
                        autoComplete="email"
                        autoCorrect="off"
                        disabled={isLoading}
                      />
                    </SimpleFormField>
                  </div>
                  <div className="space-y-1">
                    <SimpleFormField form={registerForm} name="password">
                      <Input
                        data-testid="register-password"
                        type="password"
                        placeholder="Password"
                        autoCapitalize="none"
                        autoComplete="password"
                        autoCorrect="off"
                        disabled={isLoading}
                      />
                    </SimpleFormField>
                  </div>
                  <div className="space-y-1">
                    <SimpleFormField form={registerForm} name="confirmPassword">
                      <Input
                        data-testid="register-confirm-password"
                        type="password"
                        placeholder="Confirm Password"
                        autoCapitalize="none"
                        autoComplete="password"
                        autoCorrect="off"
                        disabled={isLoading}
                      />
                    </SimpleFormField>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button data-testid="register-submit" disabled={isLoading}>
                    {isLoading && SPINNER_ELEMENT}Submit
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AuthenticationPage() {
  "use client";
  return (
    <>
      <div className="container relative grid flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0 h-screen">
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
          <div className="absolute inset-0 bg-zinc-900" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-6 w-6"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
            FPI UFMS
          </div>
        </div>
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <UserAuthForm />
          </div>
        </div>
      </div>
    </>
  );
}
