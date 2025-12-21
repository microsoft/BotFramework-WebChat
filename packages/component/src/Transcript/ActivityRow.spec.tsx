/** @jest-environment @happy-dom/jest-environment */
import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import ActivityRow from './ActivityRow';

// Mock hooks
jest.mock('botframework-webchat-api', () => ({
    hooks: {
        useActivityKeysByRead: jest.fn(() => [[], () => { }]),
        useGetHasAcknowledgedByActivityKey: jest.fn(() => () => true),
        useGetKeyByActivity: jest.fn(() => (activity) => activity.id)
    }
}), { virtual: true });

jest.mock('../providers/TranscriptFocus/useActiveDescendantId', () => jest.fn(() => [null]));
jest.mock('../providers/TranscriptFocus/useFocusByActivityKey', () => jest.fn(() => () => { }));
jest.mock('../providers/TranscriptFocus/useGetDescendantIdByActivityKey', () => jest.fn(() => () => 'descendant-id'));
jest.mock('./useActivityAccessibleName', () => jest.fn(() => ['Accessible Name']));
jest.mock('../hooks/internal/styleToEmotionObject', () => ({
    useStyleToEmotionObject: jest.fn(() => () => 'mock-class-name')
}));

jest.mock('./TranscriptFocus', () => ({
    TranscriptFocusContent: ({ children, ...props }) => <div {...props}>{children}</div>,
    TranscriptFocusContentActiveDescendant: ({ children, ...props }) => <div {...props}>{children}</div>,
    TranscriptFocusContentOverlay: ({ children }) => <div>{children}</div>,
    TranscriptFocusIndicator: () => <div />
}));

jest.mock('./FocusTrap', () => ({ children }) => <div>{children}</div>);
jest.mock('../Activity/Speak', () => () => null);

describe('ActivityRow', () => {
    let container: HTMLDivElement;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        unmountComponentAtNode(container);
        container.remove();
        container = null;
    });

    it('should render an h6 header with accessible name', () => {
        const activity = {
            id: 'activity-1',
            type: 'message',
            text: 'Hello World'
        };

        act(() => {
            render(<ActivityRow activity={activity} />, container);
        });

        const header = container.querySelector('h6');
        expect(header).toBeTruthy();
        expect(header.textContent).toBe('Accessible Name');
        expect(header.getAttribute('aria-hidden')).toBeNull();
        expect(header.className).toBe('mock-class-name');
    });
});
