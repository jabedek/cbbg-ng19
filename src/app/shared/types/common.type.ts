export type ContentListItem<T> = {
  label: string;
  id: string | number;
  data: T;
  isDisabled?: boolean;
  infos: { text: string; css: string }[];
  // options?: ContentListItemOption[];
};

export type ContentListItemOption = {
  index: number;
  key: string;
  icon: string;
  color: string;
  tooltip: string;
};

export type ContentListItemOptionEvent = { option: ContentListItemOption } & { item: any };

export type OperationDisplay =
  | { status: 'none' | 'pending'; message?: undefined }
  | {
      status: 'normal' | 'success' | 'error';
      message: string | number;
    };
