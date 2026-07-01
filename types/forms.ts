// Form-related types

export type FormState =
  | {
      success: false;
      error?: string;
      message?: never;
      emailSent?: never;
      messageStored?: never;
    }
  | {
      success: true;
      message: string;
      emailSent: boolean;
      messageStored?: boolean;
      error?: never;
    };

export interface SavedFormData {
  name: string;
  email: string;
  message: string;
}
