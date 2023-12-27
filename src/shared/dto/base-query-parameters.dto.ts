export abstract class BaseQueryParametersDto {
  sort: string;
  page: number = 1;
  limit: number = 10;
}
