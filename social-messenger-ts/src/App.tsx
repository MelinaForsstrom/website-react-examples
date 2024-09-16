import React, { useState } from 'react';
import type { ChannelFilters, ChannelOptions, ChannelSort } from 'stream-chat';
import {
  Channel,
  Chat,
  ChatView,
  Thread,
  ThreadList,
  useCreateChatClient,
} from 'stream-chat-react';
import clsx from 'clsx';
import { EmojiPicker } from 'stream-chat-react/emojis';

import data from '@emoji-mart/data';
import { init, SearchIndex } from 'emoji-mart';

import 'stream-chat-react/dist/css/v2/index.css';
import './styles/index.css';

import {
  ChannelInner,
  CreateChannel,
  MessagingSidebar,
  MessagingThreadHeader,
  SendButton,
} from './components';

import { GiphyContextProvider, useThemeContext } from './context';

import { useChecklist, useMobileView, useUpdateAppHeightOnResize } from './hooks';

import type { StreamChatGenerics } from './types';

init({ data });

type AppProps = {
  apiKey: string;
  userToConnect: { id: string; name?: string; image?: string };
  userToken: string | undefined;
  targetOrigin: string;
  channelListOptions: {
    options: ChannelOptions;
    filters: ChannelFilters;
    sort: ChannelSort;
  };
};

const EmojiPickerWithTheme = () => {
  const { theme } = useThemeContext();

  return <EmojiPicker pickerProps={{ theme }} />;
};

const App = (props: AppProps) => {
  const { apiKey, userToConnect, userToken, targetOrigin, channelListOptions } = props;
  const [isCreating, setIsCreating] = useState(false);

  const chatClient = useCreateChatClient<StreamChatGenerics>({
    apiKey,
    userData: userToConnect,
    tokenOrProvider: userToken,
  });
  const toggleMobile = useMobileView();
  const { themeClassName } = useThemeContext();

  useChecklist(chatClient, targetOrigin);
  useUpdateAppHeightOnResize();

  if (!chatClient) {
    return null; // render nothing until connection to the backend is established
  }

  return (
    <Chat client={chatClient} theme={clsx('messaging', themeClassName)}>
      <ChatView>
        <ChatView.Selector />
        <ChatView.Channels>
          <MessagingSidebar
            channelListOptions={channelListOptions}
            onClick={toggleMobile}
            onCreateChannel={() => setIsCreating(!isCreating)}
            onPreviewSelect={() => setIsCreating(false)}
          />
          <Channel
            maxNumberOfFiles={10}
            multipleUploads={true}
            SendButton={SendButton}
            ThreadHeader={MessagingThreadHeader}
            TypingIndicator={() => null}
            EmojiPicker={EmojiPickerWithTheme}
            emojiSearchIndex={SearchIndex}
            enrichURLForPreview
          >
            {isCreating && (
              <CreateChannel toggleMobile={toggleMobile} onClose={() => setIsCreating(false)} />
            )}
            <GiphyContextProvider>
              <ChannelInner theme={themeClassName} toggleMobile={toggleMobile} />
            </GiphyContextProvider>
          </Channel>
        </ChatView.Channels>
        <ChatView.Threads>
          <ThreadList />
          <ChatView.ThreadAdapter>
            <Thread virtualized />
          </ChatView.ThreadAdapter>
        </ChatView.Threads>
      </ChatView>
    </Chat>
  );
};

export default App;
