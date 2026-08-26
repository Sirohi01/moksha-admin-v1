import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ScopeProject {
  _id: string;
  code: string;
  name: string;
  programCode: string;
}

export interface ScopeOrganisation {
  code: string;
  name: string;
  allProjects: boolean;
  projects: ScopeProject[];
}

export interface MyAccess {
  isSuperAdmin: boolean;
  organisations: ScopeOrganisation[];
}

interface ScopeState {
  myAccess: MyAccess | null;
  selectedOrganisationCode: string | null;
  selectedProjectId: string | null;
  hydrated: boolean;
}

const initialState: ScopeState = {
  myAccess: null,
  selectedOrganisationCode: null,
  selectedProjectId: null,
  hydrated: false,
};

const scopeSlice = createSlice({
  name: "scope",
  initialState,
  reducers: {
    setMyAccess: (state, action: PayloadAction<MyAccess>) => {
      state.myAccess = action.payload;
      const organisations = action.payload.organisations;
      const selectedOrganisation = organisations.find((org) => org.code === state.selectedOrganisationCode);
      if (!selectedOrganisation) {
        state.selectedOrganisationCode = organisations[0]?.code ?? null;
        state.selectedProjectId = null;
      } else if (!selectedOrganisation.projects.some((project) => project._id === state.selectedProjectId)) {
        state.selectedProjectId = null;
      }
    },
    selectOrganisation: (state, action: PayloadAction<string>) => {
      state.selectedOrganisationCode = action.payload;
      state.selectedProjectId = null;
    },
    selectProject: (state, action: PayloadAction<string | null>) => {
      state.selectedProjectId = action.payload;
    },
    hydrateScope: (state, action: PayloadAction<{ selectedOrganisationCode?: string | null; selectedProjectId?: string | null } | null>) => {
      state.selectedOrganisationCode = action.payload?.selectedOrganisationCode ?? null;
      state.selectedProjectId = action.payload?.selectedProjectId ?? null;
      state.hydrated = true;
    },
    clearScope: (state) => {
      state.myAccess = null;
      state.selectedOrganisationCode = null;
      state.selectedProjectId = null;
    },
  },
});

export const { setMyAccess, selectOrganisation, selectProject, hydrateScope, clearScope } = scopeSlice.actions;
export default scopeSlice.reducer;
