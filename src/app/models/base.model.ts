export interface BaseResponse<T> {
  message: string;
  code: number;
  success: boolean;
  data: T;
}

export interface SideBarMenu {
  link: string;
  icon: string;
  menu: string;
}
