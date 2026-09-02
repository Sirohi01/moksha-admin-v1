import { createCrudApi } from "./crudApi";
import { ExternalService } from "./types";

export const externalServiceApi = createCrudApi<ExternalService>("system-services");
