"use client";

import { useEffect } from "react";
import { authApi } from "@/lib/authApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectOrganisation, selectProject, setMyAccess } from "@/store/slices/scopeSlice";

const selectClass = "h-8 max-w-44 rounded-md border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 outline-none focus:border-accent";

export default function ScopeSwitchers() {
  const dispatch = useAppDispatch();
  const authHydrated = useAppSelector((state) => state.auth.hydrated);
  const admin = useAppSelector((state) => state.auth.admin);
  const { myAccess, selectedOrganisationCode, selectedProjectId, hydrated } = useAppSelector((state) => state.scope);

  useEffect(() => {
    if (!authHydrated || !hydrated || !admin) return;
    authApi.myAccess().then((access) => dispatch(setMyAccess(access))).catch(() => undefined);
  }, [admin, authHydrated, dispatch, hydrated]);

  if (!myAccess || myAccess.organisations.length === 0) return null;
  const selectedOrganisation = myAccess.organisations.find((org) => org.code === selectedOrganisationCode);

  return (
    <div className="hidden items-center gap-2 md:flex">
      <label className="sr-only" htmlFor="organisation-switcher">Organisation</label>
      <select
        id="organisation-switcher"
        className={selectClass}
        value={selectedOrganisationCode ?? ""}
        onChange={(event) => dispatch(selectOrganisation(event.target.value))}
        aria-label="Organisation"
      >
        {myAccess.organisations.map((organisation) => (
          <option key={organisation.code} value={organisation.code}>{organisation.name}</option>
        ))}
      </select>
      {selectedOrganisation && selectedOrganisation.projects.length > 0 && (
        <>
          <label className="sr-only" htmlFor="project-switcher">Project</label>
          <select
            id="project-switcher"
            className={selectClass}
            value={selectedProjectId ?? ""}
            onChange={(event) => dispatch(selectProject(event.target.value || null))}
            aria-label="Project"
          >
            <option value="">All projects</option>
            {selectedOrganisation.projects.map((project) => (
              <option key={project._id} value={project._id}>{project.name}</option>
            ))}
          </select>
        </>
      )}
    </div>
  );
}
