// @vitest-environment jsdom
import { describe, expect, test as it } from 'vitest'
import React from 'react';
// import {createRoot} from 'react-dom/client';
import { render, RenderResult, screen } from '@testing-library/react';
// import { Window } from 'happy-dom';
// const window = new Window();
// const document = window.document;
import Tooltip from './Tooltip';
import { ReactElement } from 'react';

describe('Tooltip', () => {
    describe('rendering', () => {
        type Properties = {
            body?: string | ReactElement;
        };
        const renderComponent = (props: Properties): RenderResult => {
            const { body } = props;
            return render(<Tooltip body={body} triggerDepth={1} />);
        };
        it('should render a tooltip if a string body is provided', () => {
            const result: RenderResult = renderComponent({
                body: 'Test String',
            });
            const { findByTestId } = result;
            const tooltipOuterDiv = findByTestId('twa');
            const stringElement = findByTestId('dfa-string-content');
            const contentElement = screen.queryByTestId('dfa-element-content');

            expect(tooltipOuterDiv).toBeDefined();
            expect(stringElement).toBeDefined();
            expect(contentElement).toEqual(null);
        });
        it('should render a tooltip if a string is a ReactElement body is provided', () => {
            const result = renderComponent({ body: <div>Test Element</div> });
            const { findByTestId } = result;

            const tooltipOuterDiv = findByTestId('twa');
            const stringElement = screen.queryByTestId('dfa-string-content');
            const contentElement = findByTestId('dfa-element-content');

            expect(tooltipOuterDiv).toBeDefined();
            expect(stringElement).toEqual(null);
            expect(contentElement).toBeDefined();
        });

        it('should not render if no body provided', () => {
            renderComponent({ body: undefined });
            const stringElement = screen.queryByTestId('dfa-string-content');
            const contentElement = screen.queryByTestId('dfa-element-content');

            // expect(stringElement).not.toBeInTheDocument();
            // expect(contentElement).not.toBeInTheDocument();
            expect(stringElement).toEqual(null);
            expect(contentElement).toEqual(null);
        });

        it('should render if children is provided', () => {
            const result = render(
                <Tooltip triggerDepth={1}>this is a test content</Tooltip>
            );
            const { findByTestId } = result;

            const tooltipOuterDiv = findByTestId('twa');
            const stringElement = screen.queryByTestId('dfa-string-content');
            const contentElement = screen.findByText('this is a test content');

            expect(tooltipOuterDiv).toBeDefined();
            expect(stringElement).toEqual(null);
            expect(contentElement).toBeDefined();
        });

        it('should fail to render when depth is 0 and no previous sibling', () => {
            expect(() => render(<Tooltip body='hey' />)).toThrowError();
        });

        it('should render when depth is 0 with previous sibling', () => {
            const result = render(
                <div>
                    <div>trigger</div>
                    <Tooltip body='hey' />
                </div>
            );
            const { findByTestId } = result;
            const tooltipOuterDiv = findByTestId('twa');
            const stringElement = findByTestId('dfa-string-content');
            const contentElement = screen.queryByTestId('dfa-element-content');

            expect(tooltipOuterDiv).toBeDefined();
            expect(stringElement).toBeDefined();
            expect(contentElement).toEqual(null);
        });
    });
});

export {};
