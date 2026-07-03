import type { Meta, StoryObj } from '@storybook/react';
import { useRef } from 'react';
import type { TurnstileInstance } from '@marsidev/react-turnstile';
import {
  TurnstileExecuteWidget,
  type TurnstileExecuteWidgetProps,
} from './TurnstileExecuteWidget.js';

type TurnstileExecuteWidgetStoryProps = Omit<TurnstileExecuteWidgetProps, 'turnstile'> & {
  readonly turnstile?: Partial<TurnstileExecuteWidgetProps['turnstile']>;
};

function TurnstileExecuteWidgetStory({
  turnstile: turnstileOverrides,
  ...props
}: TurnstileExecuteWidgetStoryProps): JSX.Element {
  const turnstileRef = useRef<TurnstileInstance | undefined>(undefined);

  const turnstile: TurnstileExecuteWidgetProps['turnstile'] = {
    required: true,
    siteKey: 'mock-storybook-site-key',
    widgetKey: 0,
    turnstileRef,
    onSuccess: () => undefined,
    onExpire: () => undefined,
    onError: () => undefined,
    ...turnstileOverrides,
  };

  return <TurnstileExecuteWidget {...props} turnstile={turnstile} />;
}

const meta = {
  title: 'UI/TurnstileExecuteWidget',
  component: TurnstileExecuteWidgetStory,
  args: {
    testId: 'turnstile-execute-widget',
  },
} satisfies Meta<typeof TurnstileExecuteWidgetStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NotRequired: Story = {
  args: {
    turnstile: {
      required: false,
      siteKey: null,
    },
  },
};

export const HiddenWhenSiteKeyMissing: Story = {
  args: {
    turnstile: {
      required: true,
      siteKey: null,
    },
  },
};
