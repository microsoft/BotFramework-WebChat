import fetch, { RequestInit } from 'node-fetch';

export const logDismissalInDatabase = async (userId: string): Promise<void> => {
  const { url, body, method } = getApiCallOptions(userId, `Dismissal in database by user with id ${userId}`)

  await fetch(url, { body, method })
}

export const logTriggerInDatabase = async (userId: string): Promise<void> => {
  const { url, body, method } = getApiCallOptions(userId, `Trigger in database by user with id ${userId}`)

  await fetch(url, { body, method })
}


function getApiCallOptions(userId: string, value: string): { url: string } & RequestInit {
  const type = 'info'
  const method = 'POST'
  const url = getUrl(userId)
  const body = JSON.stringify({ type, value })

  return { url, body, method }
}

function getUrl(userId: string): string {
  //TODO 
  //note: it will not be localhost
  return `http://localhost:3000/webchat/event/user/${userId}`
}