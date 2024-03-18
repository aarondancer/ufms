import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Patch,
  Post,
  Query,
  ValidationPipe,
} from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";

import { PageDto } from "../../common/dto/page.dto";
import { RoleType } from "../../constants";
import { Auth, PublicRoute, UUIDParam } from "../../decorators";
import { FeedbackPageOptionsDto } from "./dtos/feedback-page-options.dto";
import { FeedbackDto } from "./dtos/feedback.dto";
import { FeedbackReportDto } from "./dtos/feedbackReport.dto";
import { FeedbackWithFeatureRequestsDto } from "./dtos/feedbackWithFeatureRequests.dto";
import { SubmitFormFeedbackDto } from "./dtos/submitFormFeedback.dto";
import { UpdateFeedbackStatusDto } from "./dtos/updateFeedbackStatus.dto";
import { FeedbackService } from "./feedback.service";
import { FeedbackSource } from "./feedback.types";

@Controller("feedback")
@ApiTags("feedback")
export class FeedbackController {
  constructor(private feedbackService: FeedbackService) {}

  @Post()
  @PublicRoute()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Submit feedback",
  })
  async submitFeedback(
    @Ip() ip: string,
    @Body() feedback: SubmitFormFeedbackDto,
  ): Promise<void> {
    feedback.setIp(ip);
    feedback.setSource(FeedbackSource.ONLINE_FORM);
    await this.feedbackService.create(feedback);
  }

  @Post("external")
  @PublicRoute()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Submit feedback",
  })
  async submitFeedbackExternal(
    @Ip() ip: string,
    @Body() feedback: SubmitFormFeedbackDto,
  ): Promise<void> {
    feedback.setIp(ip);
    feedback.setSource(FeedbackSource.EXTERNAL);
    await this.feedbackService.create(feedback);
  }

  @Get()
  @Auth([RoleType.USER, RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Get feedback in a paginated list",
    type: PageDto<FeedbackDto>,
  })
  getPaginatedFeedback(
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: FeedbackPageOptionsDto,
  ) {
    return this.feedbackService.getPaged(pageOptionsDto);
  }

  @Get("report")
  @Auth([RoleType.USER, RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Get top 5 and bottom 5 feedback report",
    type: FeedbackReportDto,
  })
  getFeedbackReport() {
    return this.feedbackService.generateReport();
  }

  @Get(":id")
  @Auth([RoleType.USER, RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      "Get individual feedback entry with feature requests associations",
    type: FeedbackWithFeatureRequestsDto,
  })
  getFeedback(@UUIDParam("id") userId: Uuid) {
    return this.feedbackService.getWithFeatureRequests(userId);
  }

  @Patch(":id/status")
  @Auth([RoleType.USER, RoleType.ADMIN])
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: "Update the status of an individual feedback entry",
  })
  updateStatus(
    @UUIDParam("id") userId: Uuid,
    @Body() dto: UpdateFeedbackStatusDto,
  ) {
    return this.feedbackService.updateStatus(userId, dto.status);
  }

  @Delete(":id")
  @Auth([RoleType.USER, RoleType.ADMIN])
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: "Delete a feedback entry",
  })
  deleteFeedback(@UUIDParam("id") feedbackId: Uuid) {
    return this.feedbackService.delete(feedbackId);
  }
}
