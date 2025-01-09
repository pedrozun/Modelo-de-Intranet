import {
	Home,
	Info,
	Building2,
	Mail,
	Cloud,
	Monitor,
	CalendarDays,
} from "lucide-react";

export const menuItems = [
	{ icon: Home, label: "Inicio", path: "/" },
	{
		icon: Info,
		label: "Informações",
		submenu: [
			{ label: "Papers Publicados", path: "/info/papers" },
			{ label: "Aniversários", path: "/info/birthdays" },
			{ label: "Ramais", path: "/info/extensions" },
		],
	},
	{
		icon: CalendarDays,
		label: "Sala de Reunião",
		path: "/meeting-room",
	},
	{
		icon: Building2,
		label: "ERP",
		externalPath: "https://www.google.com",
	},
	{
		icon: Mail,
		label: "Webmail",
		externalPath: "https://www.google.com",
	},
	{
		icon: Cloud,
		label: "Cloud",
		externalPath: "https://www.google.com",
	},
	{
		icon: Monitor,
		label: "TI",
		submenu: [
			{ label: "Dashboards", path: "/ti/dashboards" },
			{ label: "Agenda de Tarefas", path: "/ti/tasks" },
			{ label: "Instalações MS Office", path: "/ti/office" },
			{
				label: "Atendimento Whatsapp",
				externalPath: "https://www.google.com",
			},
		],
	},
];
