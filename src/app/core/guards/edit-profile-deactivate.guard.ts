import { EditProfileComponent } from "@features/index";

export const editProfileDeactivateGuard = (component: EditProfileComponent) => {
  return (component.canLeave) || confirm('You have unsaved changes. Discard them ?');
};