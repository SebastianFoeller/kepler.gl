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

import React, {ReactElement, useMemo, useState} from 'react';
import {scaleLinear} from 'd3-scale';
import {max, min} from 'd3-array';
import styled from 'styled-components';
import classnames from 'classnames';
import {HistogramBin} from 'reducers';

const histogramStyle = {
  highlightW: 0.7,
  unHighlightedW: 0.4
};

const HistogramWrapper = styled.svg`
  overflow: visible;
  .histogram-bars {
    rect {
      fill: ${props => props.theme.histogramFillOutRange};
    }
    rect.in-range {
      fill: ${props => props.theme.histogramFillInRange};
    }
  }
`;
interface HistogramPlotParams {
  width: number;
  height: number;
  margin: {top: number; bottom: number; left: number; right: number};
  isRanged?: boolean;
  histogram: HistogramBin[];
  histogramCollection: {[key: string]: HistogramBin[]};
  value: number[];
  brushComponent?: ReactElement;
}

function HistogramPlotFactory() {
  const HistogramPlot = ({
    width,
    height,
    margin,
    isRanged,
    histogram,
    histogramCollection,
    value,
    brushComponent
  }: HistogramPlotParams) => {
    const undefinedToZero = (x: number | undefined) => (x ? x : 0);
    const domain = useMemo(
      () =>
        [histogram[0].x0, histogram[histogram.length - 1].x1].map(item => undefinedToZero(item)),
      [histogram]
    );

    const deephistogramCollection = JSON.stringify(histogramCollection);
    const histogramCollectionDomain = useMemo(() => {
      if (!histogramCollection) return [0, 0];
      const histogramCollectX0 = Object.keys(histogramCollection).map(dataId => {
        return Number(undefinedToZero(histogramCollection[dataId][0].x0));
      });

      const histogramCollectX1 = Object.keys(histogramCollection).map(dataId => {
        const histogram = histogramCollection[dataId];
        return Number(undefinedToZero(histogram[histogram.length - 1].x1));
      });

      return [min(histogramCollectX0), max(histogramCollectX1)].map(item => undefinedToZero(item));
    }, [deephistogramCollection]);

    const combinedHistogramLength = useMemo(() => {
      if (!histogramCollection) return 0;
      return Object.keys(histogramCollection).reduce((previousValue, currentValue) => {
        return previousValue + histogramCollection[currentValue].length;
      }, 0);
    }, [deephistogramCollection]);

    const dataId = Object.keys(histogram[0]).filter(k => k !== 'x0' && k !== 'x1')[0];
    console.log('HistogramPlotFactory dataId: ', dataId);

    // use 1st for now
    const getValue = useMemo(() => d => d[dataId], [dataId]);

    const x = useMemo(
      () =>
        scaleLinear()
          .domain(domain)
          .range([0, width]),
      [domain, width]
    );

    const xCollection = useMemo(
      () =>
        scaleLinear()
          .domain(histogramCollectionDomain)
          .range([0, width]),
      [histogramCollectionDomain, width]
    );

    const y = useMemo(
      () =>
        scaleLinear()
          .domain([0, Number(max(histogram, getValue))])
          .range([0, height]),
      [histogram, height, getValue]
    );
    console.log('HistogramPlotFactory histogramCollection: ', histogramCollection);
    console.log('HistogramPlotFactory histogram: ', histogram);
    const barWidth = width / (histogramCollection ? combinedHistogramLength : histogram.length);

    return (
      <HistogramWrapper width={width} height={height} style={{marginTop: `${margin.top}px`}}>
        {histogramCollection && (
          <g className="histogram-bars">
            {Object.keys(histogramCollection).map(dataId => {
              return histogramCollection[dataId].map(bar => {
                const inRange =
                  undefinedToZero(bar.x1) <= value[1] && undefinedToZero(bar.x0) >= value[0];
                const wRatio = inRange ? histogramStyle.highlightW : histogramStyle.unHighlightedW;
                return (
                  <rect
                    className={classnames({'in-range': inRange})}
                    key={bar.x0}
                    height={y(getValue(bar))}
                    width={barWidth * wRatio}
                    x={xCollection(undefinedToZero(bar.x0)) + (barWidth * (1 - wRatio)) / 2}
                    rx={1}
                    ry={1}
                    y={height - y(getValue(bar))}
                  />
                );
              });
            })}
          </g>
        )}
        {!histogramCollection && (
          <g className="histogram-bars">
            {histogram.map(bar => {
              const inRange =
                undefinedToZero(bar.x1) <= value[1] && undefinedToZero(bar.x0) >= value[0];
              const wRatio = inRange ? histogramStyle.highlightW : histogramStyle.unHighlightedW;
              return (
                <rect
                  className={classnames({'in-range': inRange})}
                  key={bar.x0}
                  height={y(getValue(bar))}
                  width={barWidth * wRatio}
                  x={x(undefinedToZero(bar.x0)) + (barWidth * (1 - wRatio)) / 2}
                  rx={1}
                  ry={1}
                  y={height - y(getValue(bar))}
                />
              );
            })}
          </g>
        )}
        <g transform={`translate(${isRanged ? 0 : barWidth / 2}, 0)`}>{brushComponent}</g>
      </HistogramWrapper>
    );
  };

  const EmpptyOrPlot = props =>
    !props.histogram || !props.histogram.length ? null : <HistogramPlot {...props} />;

  return EmpptyOrPlot;
}
export default HistogramPlotFactory;
