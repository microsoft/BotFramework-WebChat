import { createHeroCardPolymiddleware, heroCardComponent } from 'botframework-webchat-api/middleware';
import React from 'react';

import HeroCardContent from '../adaptiveCards/Attachment/HeroCardContent';

function createDefaultHeroCardPolymiddleware() {
  return createHeroCardPolymiddleware(() => ({ heroCard }) =>
    heroCardComponent(HeroCardContent, { content: heroCard })
  );
}

export default createDefaultHeroCardPolymiddleware;
