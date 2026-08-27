"use client";

import MokshaDashboard from "@/components/dashboard/MokshaDashboard";
import ArogyaDashboard from "@/components/dashboard/ArogyaDashboard";
import NamoGangeDashboard from "@/components/dashboard/NamoGangeDashboard";
import { useAppSelector } from "@/store/hooks";

export default function DashboardPage() {
  const organisationCode = useAppSelector((state) => state.scope.selectedOrganisationCode);

  if (organisationCode === "AROGYA") return <ArogyaDashboard />;
  if (organisationCode === "NAMOGANGE") return <NamoGangeDashboard />;
  return <MokshaDashboard />;
}
