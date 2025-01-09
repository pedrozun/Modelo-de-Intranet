import { Inicio } from "../pages/Inicio";
import { PapersPage } from "../pages/info/Papers";
import { BirthdaysPage } from "../pages/info/Birthdays";
import { ExtensionsPage } from "../pages/info/Extensions";
import { DashboardsPage } from "../pages/ti/Dashboards";
import { TasksPage } from "../pages/ti/Tasks";
import { OfficePage } from "../pages/ti/Office";
import { MeetingRoomPage } from "../pages/MeetingRoom";
import { UnauthorizedPage } from "../pages/Unauthorized";

interface RouteConfig {
	path: string;
	Component: React.ComponentType;
	requiredGroup?: string;
}

export const protectedRoutes: RouteConfig[] = [
	{ path: "/", Component: Inicio },
	{ path: "/info/papers", Component: PapersPage },
	{ path: "/info/birthdays", Component: BirthdaysPage },
	{ path: "/info/extensions", Component: ExtensionsPage },
	{
		path: "/ti/dashboards",
		Component: DashboardsPage,
		requiredGroup: "Dashboard_Tarefas",
	},
	{ path: "/ti/tasks", Component: TasksPage },
	{
		path: "/ti/office",
		Component: OfficePage,
		requiredGroup: "Sistema_Office_KM",
	},
	{ path: "/meeting-room", Component: MeetingRoomPage },
	{ path: "/unauthorized", Component: UnauthorizedPage },
];
