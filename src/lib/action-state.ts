/** Bentuk state yang dikembalikan oleh setiap server action form. */
export type ActionState = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
  /** Penanda unik agar efek sukses (reset form) terpicu setiap submit */
  ts?: number;
};

export const initialActionState: ActionState = {};

export type FormAction = (prev: ActionState, formData: FormData) => Promise<ActionState>;
