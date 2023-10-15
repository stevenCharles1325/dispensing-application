const driveTabs = ['Images', 'Upload new image'] as const;
type IDriveTabs = (typeof driveTabs)[number];

export type { IDriveTabs };
export default driveTabs;
