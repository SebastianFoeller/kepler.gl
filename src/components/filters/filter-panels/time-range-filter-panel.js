// Copyright (c) 2022 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import React, {useCallback, useMemo} from 'react';
import TimeRangeFilterFactory from 'components/filters/time-range-filter';
import {Clock} from 'components/common/icons';
import SourceDataSelectorFactory from 'components/side-panel/common/source-data-selector';
import FilterPanelHeaderFactory from 'components/side-panel/filter-panel/filter-panel-header';
import PanelHeaderActionFactory from 'components/side-panel/panel-header-action';
import FieldSelectorFactory from '../../common/field-selector';
import {StyledFilterContent} from 'components/common/styled-components';
import MultiTimeFilterPanelFactory from 'components/filters/filter-panels/multi-time-filter-panel';
import styled from 'styled-components';
import FieldTokenFactory from 'components/common/field-token';
import {ALL_FIELD_TYPES} from 'constants/default-settings';

const StyledFilterHeader = styled.div`
  height: auto;
`;

const StyledToken = styled.div`
  display: inline-block;
  margin: 0 ${props => props.theme.fieldTokenRightMargin}px 0 0;
  width: 100%;
`;

TimeRangeFilterPanelFactory.deps = [
  MultiTimeFilterPanelFactory,
  FilterPanelHeaderFactory,
  FieldSelectorFactory,
  PanelHeaderActionFactory,
  TimeRangeFilterFactory,
  FieldTokenFactory
];

export function getSupportedFilterFields(supportedFilterTypes, fields) {
  return supportedFilterTypes
    ? fields.filter(field => supportedFilterTypes.includes(field.type))
    : fields;
}

function TimeRangeFilterPanelFactory(
  MultiTimeFilterPanel,
  FilterPanelHeader,
  FieldSelector,
  PanelHeaderAction,
  TimeRangeFilter,
  FieldToken
) {
  /** @type {import('./filter-panel-types').FilterPanelComponent} */
  const TimeRangeFilterPanel = React.memo(
    ({
      idx,
      datasets,
      allAvailableFields,
      filter,
      isAnyFilterAnimating,
      enlargeFilter,
      setFilter,
      removeFilter,
      toggleAnimation
    }) => {
      const onSetFilter = useCallback(value => setFilter(idx, 'value', value), [idx, setFilter]);

      const panelActions = useMemo(
        () => [
          {
            id: filter.id,
            onClick: enlargeFilter,
            tooltip: 'tooltip.timePlayback',
            iconComponent: Clock,
            active: filter.enlarged
          }
        ],
        [filter.id, filter.enlarged, enlargeFilter]
      );

      const onFieldSelector = useCallback(field => setFilter(idx, 'name', field.name), [
        idx,
        setFilter
      ]);

      const onSourceDataSelector = useCallback(value => setFilter(idx, 'dataId', value), [
        idx,
        setFilter
      ]);

      const fieldValue = useMemo(
        () => ((Array.isArray(filter.name) ? filter.name[0] : filter.name)),
        [filter.name]
      );

      const dataset = datasets[filter.dataId[0]];
      const supportedFields = useMemo(
        () => getSupportedFilterFields(dataset.supportedFilterTypes, allAvailableFields),
        [dataset.supportedFilterTypes, allAvailableFields]
      );

      return (
        <>
          <StyledFilterHeader>
            <FilterPanelHeader
              datasets={[dataset]}
              allAvailableFields={allAvailableFields}
              idx={idx}
              filter={filter}
              removeFilter={removeFilter}
            >
              {filter.dataId.length <= 1 && (
                <FieldSelector
                  inputTheme="secondary"
                  fields={allAvailableFields}
                  value={fieldValue}
                  erasable={false}
                  onSelect={onFieldSelector}
                />
              )}
              {filter.dataId.length > 1 && (
                <StyledToken>
                  <FieldToken type={ALL_FIELD_TYPES.timestamp} />
                </StyledToken>
              )}
              {panelActions &&
                panelActions.map(panelAction => (
                  <PanelHeaderAction
                    id={panelAction.id}
                    key={panelAction.id}
                    onClick={panelAction.onClick}
                    tooltip={panelAction.tooltip}
                    IconComponent={panelAction.iconComponent}
                    active={panelAction.active}
                  />
                ))}
            </FilterPanelHeader>
          </StyledFilterHeader>
          <StyledFilterContent>
            <MultiTimeFilterPanel
              datasets={datasets}
              filter={filter}
              idx={idx}
              onFieldSelector={onFieldSelector}
              onSourceDataSelector={onSourceDataSelector}
              setFilter={setFilter}
              allAvailableFields={supportedFields}
            />
            {filter.type && !filter.enlarged && (
              <div className="filter-panel__filter">
                <TimeRangeFilter
                  filter={filter}
                  idx={idx}
                  isAnyFilterAnimating={isAnyFilterAnimating}
                  toggleAnimation={toggleAnimation}
                  setFilter={onSetFilter}
                />
              </div>
            )}
          </StyledFilterContent>
        </>
      );
    }
  );

  TimeRangeFilterPanel.displayName = 'TimeRangeFilterPanel';

  return TimeRangeFilterPanel;
}

export default TimeRangeFilterPanelFactory;
