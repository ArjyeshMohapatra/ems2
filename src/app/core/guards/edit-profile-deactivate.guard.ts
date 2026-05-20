import { EditProfileComponent } from "@features/index";
import { EventLoggerService } from "@core/services";
import { inject } from "@angular/core";

export const editProfileDeactivateGuard = (component: EditProfileComponent) => {
  const logger = inject(EventLoggerService)
  logger.log('EditProfileDeactivateGuard', 'LEAVING_UNSAVED_CHANGES', {});
  return (component.canLeave) || confirm('You have unsaved changes. Discard them ?');
};