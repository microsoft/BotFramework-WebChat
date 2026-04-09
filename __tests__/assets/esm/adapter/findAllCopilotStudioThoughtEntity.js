/*!
 * Copyright (C) Microsoft Corporation. All rights reserved.
 */

export default function findAllCopilotStudioThoughtEntity(activity) {
  return activity.entities?.filter(entity => entity.type === 'thought') ?? [];
}
