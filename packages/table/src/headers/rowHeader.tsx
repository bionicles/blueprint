/**
 * Copyright 2016 Palantir Technologies, Inc. All rights reserved.
 * Licensed under the BSD-3 License as modified (the “License”); you may obtain a copy
 * of the license at https://github.com/palantir/blueprint/blob/master/LICENSE
 * and https://github.com/palantir/blueprint/blob/master/PATENTS
 */

import * as classNames from "classnames";
import * as React from "react";

import * as Classes from "../common/classes";
import { IRowIndices } from "../common/grid";
import { RoundSize } from "../common/roundSize";
import { IClientCoordinates } from "../interactions/draggable";
import { IIndexedResizeCallback } from "../interactions/resizable";
import { Orientation } from "../interactions/resizeHandle";
import { IRegion, RegionCardinality, Regions } from "../regions";
import { Header, IHeaderProps, shouldHeaderComponentUpdate } from "./header";
import { IRowHeaderCellProps, RowHeaderCell } from "./rowHeaderCell";

export type IRowHeaderRenderer = (rowIndex: number) => React.ReactElement<IRowHeaderCellProps>;

export interface IRowHeights {
    minRowHeight?: number;
    maxRowHeight?: number;
    defaultRowHeight?: number;
}

export interface IRowHeaderProps extends IHeaderProps, IRowHeights, IRowIndices {
    /**
     * A callback invoked when user is done resizing the column
     */
    onRowHeightChanged: IIndexedResizeCallback;

    /**
     * Renders the cell for each row header
     */
    renderRowHeader?: IRowHeaderRenderer;
}

export class RowHeader extends React.Component<IRowHeaderProps, {}> {
    public defaultProps = {
        renderRowHeader: renderDefaultRowHeader,
    };

    public shouldComponentUpdate(nextProps: IRowHeaderProps) {
        return shouldHeaderComponentUpdate(this.props, nextProps, this.isSelectedRegionRelevant);
    }

    public render() {
        const {
            // from IRowHeaderProps
            onRowHeightChanged,
            renderRowHeader,

            // from IRowHeights
            minRowHeight,
            maxRowHeight,
            defaultRowHeight,

            // from IRowIndices
            rowIndexStart,
            rowIndexEnd,

            // from IHeaderProps
            ...spreadableProps,
        } = this.props;

        return (
            <Header
                convertPointToIndex={this.convertPointToRow}
                endIndex={this.props.rowIndexEnd}
                fullRegionCardinality={RegionCardinality.FULL_ROWS}
                getCellExtremaClasses={this.getCellExtremaClasses}
                getCellIndexClass={Classes.rowCellIndexClass}
                getCellSize={this.getRowHeight}
                getDragCoordinate={this.getDragCoordinate}
                getIndexClass={Classes.rowIndexClass}
                getMouseCoordinate={this.getMouseCoordinate}
                handleResizeEnd={this.handleResizeEnd}
                handleSizeChanged={this.handleSizeChanged}
                headerCellIsReorderablePropName={"isRowReorderable"}
                headerCellIsSelectedPropName={"isRowSelected"}
                isCellSelected={this.isCellSelected}
                isGhostIndex={this.isGhostIndex}
                maxSize={this.props.maxRowHeight}
                minSize={this.props.minRowHeight}
                renderGhostCell={this.renderGhostCell}
                renderHeaderCell={this.props.renderRowHeader}
                resizeOrientation={Orientation.HORIZONTAL}
                startIndex={this.props.rowIndexStart}
                toRegion={this.toRegion}
                wrapCells={this.wrapCells}
                {...spreadableProps}
            />
        );
    }

    private wrapCells = (cells: Array<React.ReactElement<any>>) => {
        const { grid, viewportRect } = this.props;

        // always set height so that the layout can push out the element unless it overflows.
        const style: React.CSSProperties = {
            height: `${grid.getRect().height}px`,
        };

        // use CSS translation to offset the cells
        if (viewportRect != null) {
            const startIndex = this.getStartIndex();
            const topOffset = grid.getRowRect(startIndex).top - viewportRect.top;
            style.transform = `translate3d(0, ${topOffset}px, 0)`;
        }

        return (
            <RoundSize>
                <div style={style}>
                    {cells}
                </div>
            </RoundSize>
        );
    }

    private convertPointToRow = (clientXOrY: number, useMidpoint?: boolean) => {
        const { locator } = this.props;
        return locator != null ? locator.convertPointToRow(clientXOrY, useMidpoint) : null;
    }

    private getCellExtremaClasses = (index: number, endIndex: number) => {
        return this.props.grid.getExtremaClasses(index, 0, endIndex, 1);
    }

    private getRowHeight = (index: number) => {
        return this.props.grid.getRowRect(index).height;
    }

    private getDragCoordinate = (clientCoords: IClientCoordinates) => {
        return clientCoords[1]; // y-coordinate
    }

    private getMouseCoordinate = (event: MouseEvent) => {
        return event.clientY;
    }

    private getStartIndex = () => {
        return this.props.rowIndexStart;
    }

    private handleResizeEnd = (index: number, size: number) => {
        this.props.onResizeGuide(null);
        this.props.onRowHeightChanged(index, size);
    }

    private handleSizeChanged = (index: number, size: number) => {
        const rect = this.props.grid.getRowRect(index);
        this.props.onResizeGuide([rect.top + size]);
    }

    private isCellSelected = (index: number) => {
        return Regions.hasFullRow(this.props.selectedRegions, index);
    }

    private isGhostIndex = (index: number) => {
        return this.props.grid.isGhostIndex(index, -1);
    }

    private renderGhostCell = (index: number, extremaClasses: string[]) => {
        const rect = this.props.grid.getGhostCellRect(index, 0);
        return (
            <RowHeaderCell
                className={classNames(extremaClasses)}
                index={index}
                key={Classes.rowIndexClass(index)}
                loading={this.props.loading}
                style={{ height: `${rect.height}px` }}
            />);
    }

    private toRegion = (index1: number, index2?: number) => {
        // the `this` value is messed up for Regions.row, so we have to have a wrapper function here
        return Regions.row(index1, index2);
    }

    private isSelectedRegionRelevant = (selectedRegion: IRegion) => {
        const regionCardinality = Regions.getRegionCardinality(selectedRegion);
        return regionCardinality === RegionCardinality.FULL_ROWS
            || regionCardinality === RegionCardinality.FULL_TABLE;
    }
}

/**
 * A default implementation of `IRowHeaderRenderer` that displays 1-indexed
 * numbers for each row.
 */
export function renderDefaultRowHeader(rowIndex: number) {
    return <RowHeaderCell index={rowIndex} name={`${rowIndex + 1}`}/>;
}
