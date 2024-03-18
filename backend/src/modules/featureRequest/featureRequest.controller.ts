import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Query,
  ValidationPipe,
} from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { PageDto } from "../../common/dto/page.dto";
import { RoleType } from "../../constants";
import { Auth, AuthUser, PublicRoute, UUIDParam } from "../../decorators";
import { UserEntity } from "../user/user.entity";
import { AssignFeedbackToFeatureRequestDto } from "./dtos/assignFeedbackToFeatureRequest.dto";
import { CreateFeatureRequestDto } from "./dtos/createFeatureRequest.dto";
import { FeatureRequestPageOptionsDto } from "./dtos/feature-request-page-options-dto";
import { FeatureRequestDto } from "./dtos/featureRequest.dto";
import { FeatureRequestScoredDto } from "./dtos/featureRequestScored.dto";
import { FeatureRequestWithUpdatesDto } from "./dtos/featureRequestWithUpdates.dto";
import { PostCommentDto } from "./dtos/postUpdateDto";
import { UpdateFeatureRequestStatusDto } from "./dtos/updateFeatureRequestStatusDto";
import { FeatureRequestService } from "./featureRequest.service";
import { FeatureUpdateType } from "./featureRequest.types";

@Controller("featurerequest")
@ApiTags("featurerequest")
export class FeatureRequestController {
  constructor(private featureRequestService: FeatureRequestService) {}

  @Get()
  @Auth([RoleType.USER, RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Get featureRequest in a paginated list",
    type: PageDto<FeatureRequestScoredDto>,
  })
  getPaginatedFeatureRequest(
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: FeatureRequestPageOptionsDto,
  ) {
    return this.featureRequestService.getPagedWithScores(pageOptionsDto);
  }

  @Get("report")
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Get top 5 highest priority unscheduled feature requests",
    type: [FeatureRequestScoredDto],
  })
  getFeatureRequestReport() {
    return this.featureRequestService.generateReport();
  }

  @Get(":id")
  @Auth([RoleType.USER, RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Get individual featureRequest entry",
    type: FeatureRequestDto,
  })
  getFeatureRequest(@UUIDParam("id") userId: Uuid) {
    return this.featureRequestService.getOneWithUpdatesAndFeedback(userId);
  }

  @Get("public/:id")
  @PublicRoute()
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Get individual featureRequest entry with updates",
    type: FeatureRequestWithUpdatesDto,
  })
  getPublicFeatureRequest(@UUIDParam("id") userId: Uuid) {
    return this.featureRequestService.getOneWithUpdates(userId);
  }

  @Post()
  @Auth([RoleType.USER, RoleType.ADMIN])
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Create feature request",
    type: FeatureRequestDto,
  })
  createFeatureRequest(
    @AuthUser() user: UserEntity,
    @Body() featureRequest: CreateFeatureRequestDto,
  ): Promise<FeatureRequestDto> {
    return this.featureRequestService.create(user.id, featureRequest);
  }

  @Delete(":id")
  @Auth([RoleType.USER, RoleType.ADMIN])
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: "Delete feature request",
  })
  async deleteFeatureRequest(@UUIDParam("id") id: Uuid): Promise<void> {
    await this.featureRequestService.delete(id);
  }

  @Post(":id/comment")
  @Auth([RoleType.USER, RoleType.ADMIN])
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Post update to feature request",
  })
  async postCommentToFeatureRequest(
    @AuthUser() user: UserEntity,
    @UUIDParam("id") id: Uuid,
    @Body() update: PostCommentDto,
  ): Promise<void> {
    await this.featureRequestService.postUpdate(
      user.id,
      id,
      FeatureUpdateType.COMMENT,
      update,
    );
  }

  @Patch(":id/status")
  @Auth([RoleType.USER, RoleType.ADMIN])
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: "Update status of a feature request",
  })
  async updateStatusOfFeatureRequest(
    @AuthUser() user: UserEntity,
    @UUIDParam("id") id: Uuid,
    @Body() update: UpdateFeatureRequestStatusDto,
  ): Promise<void> {
    await this.featureRequestService.updateStatus(
      user.id,
      id,
      update.getStatus(),
    );
  }

  @Post(":id/feedback")
  @Auth([RoleType.USER, RoleType.ADMIN])
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Associate feedback to feature request",
  })
  async associateFeedbackToFeatureRequest(
    @AuthUser() user: UserEntity,
    @UUIDParam("id") id: Uuid,
    @Body() dto: AssignFeedbackToFeatureRequestDto,
  ): Promise<void> {
    await this.featureRequestService.associateFeedback(
      user.id,
      id,
      dto.getFeedbackId(),
    );
  }

  @Delete(":id/feedback/:feedbackId")
  @Auth([RoleType.USER, RoleType.ADMIN])
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: "Remove feedback from feature request",
  })
  async removeFeedbackFromFeatureRequest(
    @UUIDParam("id") id: Uuid,
    @UUIDParam("feedbackId") feedbackId: Uuid,
  ): Promise<void> {
    await this.featureRequestService.removeFeedback(id, feedbackId);
  }
}
