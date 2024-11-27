/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'selector',
  content: [
    "./src/home/home.component.{html,ts}",
    "./src/app/app.component.{html,ts}",
    "./src/login/login-form/login-form.component.{html,ts}",
    "./src/login/create-account/create-account.component.{html,ts}",
    "./src/login/email-verification/email-verification.component.{html,ts}",
    "./src/login/forgot-password/forgot-password.component.{html,ts}",
    "./src/chat/chat-list/chat-list.component.{html,ts}",
    "./src/chat/chat-page/chat-page.component.{html,ts}",
    "./src/chat/chat-message/chat-message.component.{html,ts}",
    "./src/chat/chat-list-element/chat-list-element.component.{html,ts}",
    "./src/user/user-list/user-list-element.component.{html,ts}",
    "./src/chat/create-chat/create-chat.component.{html,ts}",
    "./src/chat/chat-tab/chat-tab.component.{html,ts}",
    "./src/user/profile/profile.component.{html,ts}",
    "./src/user/friends/friends.component.{html,ts}"
  ],
  theme: {
    extend: {
      fontFamily: {

      },
    },
  },
  plugins: [],
}