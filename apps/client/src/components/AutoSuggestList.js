/**
 * THIS FILE IS COPY PASTED FROM:
 * https://github.com/Amsterdam/signals-frontend/blob/develop/src/components/AutoSuggest/components/SuggestList/index.js
 *
 * It has not been edited yet.
 *
 * Improvements:
 * - Add test
 * - Convert to TS
 */

import { ChevronRight } from "@datapunt/asc-assets";
import { Icon, themeColor, themeSpacing } from "@datapunt/asc-ui";
import PropTypes from "prop-types";
import React, { Fragment, useCallback, useEffect, useRef } from "react";
import styled from "styled-components";

const StyledList = styled.ul`
  max-width: 160px;
  margin: 0;
  padding: 0;
  border: 1px solid ${themeColor("tint", "level5")};
  border-top: 0;
  background-color: white;
`;

const Li = styled.li`
  line-height: ${themeSpacing(5)};
  padding: ${themeSpacing(2)};
  cursor: pointer;
  display: flex;

  &:hover,
  &:focus {
    background-color: ${themeColor("tint", "level3")};
  }
`;

const Chevron = styled(ChevronRight)`
  display: inline-block;
`;

const StyledIcon = styled(Icon)`
  margin: 0 ${themeSpacing(2)} 0 0;
  display: inline-block;
`;

const SuggestList = ({
  activeIndex,
  className,
  role,
  options,
  onSelectOption,
  ...rest
}) => {
  const listRef = useRef(null);

  useEffect(() => {
    const list = listRef.current;

    if (activeIndex >= 0 && activeIndex < options.length) {
      list.children[activeIndex].focus();
    }
  }, [activeIndex, options.length]);

  const onSelect = useCallback(
    (option) => {
      onSelectOption(option);
    },
    [onSelectOption]
  );

  const handleKeyDown = useCallback(
    (event, option) => {
      event.preventDefault();

      // preventing the page from scrolling when cycling through the list of options
      switch (event.key) {
        case "ArrowUp":
        case "Up":
        case "ArrowDown":
        case "Down":
          break;

        case "Enter":
          onSelect(option);
          break;

        default:
          break;
      }
    },
    [onSelect]
  );

  if (!options.length) {
    return null;
  }

  return (
    <StyledList
      className={className}
      data-testid="suggestList"
      role={role}
      ref={listRef}
      {...rest}
    >
      {options.map((option) => (
        <Li
          id={option.id}
          data-id={option.id}
          key={option.id}
          onMouseDown={() => onSelect(option)} // Use instead of onClick to prevent a bug with the focus state
          onKeyDown={(event) => handleKeyDown(event, option)}
          role="option"
          tabIndex={-1}
        >
          <Fragment>
            <StyledIcon size={12}>
              <Chevron />
            </StyledIcon>
            {option.value}
          </Fragment>
        </Li>
      ))}
    </StyledList>
  );
};

SuggestList.defaultProps = {
  activeIndex: 0,
  className: "",
  role: "listbox",
};

SuggestList.propTypes = {
  /** Index (zero-based) of the list item that should get focus */
  activeIndex: PropTypes.number,
  /** @ignore */
  className: PropTypes.string,
  /** Callback function that gets called whenever a list item is clicked or when return is pressed */
  onSelectOption: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      value: PropTypes.string.isRequired,
    })
  ).isRequired,
  /** aria-role for the listbox element */
  role: PropTypes.string,
};

export default SuggestList;