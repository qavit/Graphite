import type { ReactElement, SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

function makeIcon(path: ReactElement) {
  return function Icon(props: IconProps) {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false" {...props}>
        {path}
      </svg>
    );
  };
}

export const CopyIcon = makeIcon(
  <path
    d="M9 9.5V7.75A2.75 2.75 0 0 1 11.75 5h5.5A2.75 2.75 0 0 1 20 7.75v5.5A2.75 2.75 0 0 1 17.25 16H15.5"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  />,
);

export const DownloadIcon = makeIcon(
  <>
    <path d="M12 4.5v9.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="m8.5 10.8 3.5 3.6 3.5-3.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 18.5h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </>,
);

export const FolderOpenIcon = makeIcon(
  <>
    <path d="M4.5 7.5h4l1.8 2.2h9.2a1 1 0 0 1 1 1v6.8a1 1 0 0 1-1 1H4.5a1 1 0 0 1-1-1V8.5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M5.5 10.2h13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </>,
);

export const FileIcon = makeIcon(
  <>
    <path d="M7.5 3.8h6.3L18 8v12.2H7.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M13.8 3.8V8H18" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M9.3 11.2h6.1M9.3 14.2h6.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </>,
);

export const GridIcon = makeIcon(
  <>
    <path d="M4.5 4.5h15v15h-15z" stroke="currentColor" strokeWidth="1.8" />
    <path d="M4.5 9.5h15M4.5 14.5h15M9.5 4.5v15M14.5 4.5v15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </>,
);

export const HandIcon = makeIcon(
  <>
    <path d="M8.2 13.2V7.8a1.2 1.2 0 0 1 2.4 0V12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M10.6 11V6.8a1.2 1.2 0 1 1 2.4 0V12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M13 12V7.9a1.2 1.2 0 1 1 2.4 0V14c0 2.7-1.7 4.5-4.4 4.5H10c-2.1 0-3.6-1.1-4.6-3.2l-1-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </>,
);

export const InspectIcon = makeIcon(
  <>
    <path d="M4.5 8.5V5.5h3M19.5 8.5V5.5h-3M4.5 15.5v3h3M19.5 15.5v3h-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M9.5 12a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0Z" stroke="currentColor" strokeWidth="1.8" />
  </>,
);

export const LanguageIcon = makeIcon(
  <>
    <path d="M5 7.5h7M8.5 5v2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M6.2 10.2c.8 2.2 2.2 4.1 4.3 5.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M17.5 7.5c-1 4.2-3.8 7.6-7.2 9.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M13.5 19.5l4-12 4 12M15 15.2h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </>,
);

export const MoonIcon = makeIcon(
  <path
    d="M15.8 14.2A6.4 6.4 0 0 1 9.6 5a7.2 7.2 0 1 0 10.4 8.8 6.3 6.3 0 0 1-4.2.4Z"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinejoin="round"
  />,
);

export const PencilIcon = makeIcon(
  <>
    <path d="M4.5 19.5h4.2L18.7 9.5a1.8 1.8 0 0 0 0-2.6l-1.6-1.6a1.8 1.8 0 0 0-2.6 0L4.5 15.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M12.6 6.2 16.8 10.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </>,
);

export const PointerIcon = makeIcon(
  <>
    <path d="M6.5 5.5 18 13.8l-5 1.1-2.4 4.2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="m12.5 15 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </>,
);

export const SearchIcon = makeIcon(
  <>
    <circle cx="10.2" cy="10.2" r="4.8" stroke="currentColor" strokeWidth="1.8" />
    <path d="m14 14 4.2 4.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </>,
);

export const SunIcon = makeIcon(
  <>
    <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" />
    <path d="M12 4.5v2M12 17.5v2M4.5 12h2M17.5 12h2M6.2 6.2l1.4 1.4M16.4 16.4l1.4 1.4M17.8 6.2l-1.4 1.4M7.6 16.4l-1.4 1.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </>,
);

export const TypeIcon = makeIcon(
  <>
    <path d="M5.5 6h13M12 6v12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M8.5 18h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </>,
);

export const VectorIcon = makeIcon(
  <>
    <path d="M4.5 16.5 17.2 5.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M17.2 5.8v4M17.2 5.8h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </>,
);

export const ZoomInIcon = makeIcon(
  <>
    <circle cx="10.5" cy="10.5" r="5.5" stroke="currentColor" strokeWidth="1.8" />
    <path d="m14.8 14.8 4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M10.5 8.2v4.6M8.2 10.5h4.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </>,
);

export const ZoomOutIcon = makeIcon(
  <>
    <circle cx="10.5" cy="10.5" r="5.5" stroke="currentColor" strokeWidth="1.8" />
    <path d="m14.8 14.8 4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M8.2 10.5h4.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </>,
);

export const FitIcon = makeIcon(
  <>
    <path d="M4.5 8.5V5.5h3M19.5 8.5V5.5h-3M4.5 15.5v3h3M19.5 15.5v3h-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M9 9h6v6H9z" stroke="currentColor" strokeWidth="1.8" />
  </>,
);

export const ResetIcon = makeIcon(
  <>
    <path d="M7.5 6.8A7.2 7.2 0 1 1 5.8 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M5.5 6.5v4h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </>,
);

export const SaveIcon = makeIcon(
  <>
    <path d="M5.5 5.5h11.2l1.8 1.8v11.2H5.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M8.5 5.5v5h5v-5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M8 19h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </>,
);

export const PanelIcon = makeIcon(
  <>
    <path d="M4.5 5.5h15v13H4.5z" stroke="currentColor" strokeWidth="1.8" />
    <path d="M10 5.5v13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </>,
);
