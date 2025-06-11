export type RadioOption<T = void> = { label: string; value: T; checked: boolean };
export type DropdownOption = { label: string; value: string; data?: any };

export type AttributesConfig = { min?: number; max?: number; step?: number; maxLength?: number };
