const events = [
  {
    target: {
      key: 'portrait_turing'
    }
  },
  {
    target: {
      key: 'statue_credentials'
    }
  },
  {
    target: {}
  }
]

const objectNotifications = {
  statue_credentials: 'Welcome to the Catacombs. Now that I have your Twilio credentials, you may complete the challenges before you.',
  portrait_hopper: 'I am the Hopper portrait',
  portrait_lovelace: 'I am the Lovelace portrait',
  portrait_neumann: 'I am the Neumann portrait',
  portrait_turing: 'I am the Turing portrait',
  default: 'Hello, operator!'
}

const showObjectNotification = ({target:{key='default'}}) => {
  console.log(objectNotifications[key]);
}

showObjectNotification(events[1]);