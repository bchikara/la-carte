import React, { useState, MouseEvent } from "react";
import { makeStyles } from '@mui/styles'; // Note: @mui/styles is deprecated in MUI v5. Consider migrating.
import { Theme } from '@mui/material/styles'; // Import Theme for typing
import clsx from "clsx";
import { DateRange, Range, DateRangeProps } from "react-date-range"; // Import Range and DateRangeProps

// Define the styles with Theme type for proper type checking
const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: "100%",

    "& .rdrDateDisplayWrapper": {
      cursor: "pointer",
    },

    "& .rdrMonths, & .rdrDateInput": {
      // pointerEvents: "none", // Original commented out line
    },

    "&.collapsed": {
      "& .rdrMonthAndYearWrapper, & .rdrMonths": {
        display: "none",
      },
    },
  },
}));

// Define the props for your CollapseDateRange component
// It should include props that DateRange itself accepts,
// as you are spreading `...props` onto it.
interface CollapseDateRangeProps extends Omit<DateRangeProps, 'className' | 'onChange'> {
  // You might want to be more specific about the ranges and onChange if needed
  // For example, if you know the structure of your ranges:
  ranges?: Range[];
  onChange?: (item: any) => void; // Replace 'any' with the actual type of 'item' if known
  // Add any other custom props your CollapseDateRange component might accept
}

const CollapseDateRange: React.FC<CollapseDateRangeProps> = (props) => {
  // Pass props to useStyles if it expects them, though typically it only uses theme.
  // If your useStyles hook specifically uses props, you'd type them there too.
  const classes = useStyles();

  const [collapsed, setCollapsed] = useState<boolean>(true);

  const toggleCollapse = (event: MouseEvent<HTMLDivElement>) => {
    // Ensure the event target is an HTMLElement to access classList
    const target = event.target as HTMLElement;
    if (
      target.classList.contains("rdrDateDisplay") ||
      target.classList.contains("rdrDateDisplayWrapper")
    ) {
      setCollapsed((prev) => !prev);
    }
  };

  return (
    <div onClick={toggleCollapse}>
      {/*
        Pass the necessary props to DateRange.
        If `DateRangeProps` is too broad or has conflicts,
        you might need to pick specific props or create a more tailored interface.
      */}
      <DateRange
        {...props} // Spread the props passed to CollapseDateRange
        className={clsx(classes.root, collapsed && "collapsed")}
      />
    </div>
  );
};

export default CollapseDateRange;
