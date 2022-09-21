export interface ThrowErrorsOptions {
  notFound: boolean;
}

export class DefaultThrowErrorsOptions implements ThrowErrorsOptions {
  notFound = false;
}
