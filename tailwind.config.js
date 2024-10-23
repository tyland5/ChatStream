/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'selector',
  content: [
    "./src/home/home.component.{html,ts}",
    "./src/app/app.component.{html,ts}",
    "./src/login/login-form/login-form.component.{html,ts}",
    "./src/chat/chat-list/chat-list.component.{html,ts}",
    "./src/chat/chat-page/chat-page.component.{html,ts}",
    "./src/chat/chat-message/chat-message.component.{html,ts}",
    "./src/chat/chat-list-element/chat-list-element.component.{html,ts}",
    "./src/user/user-list/user-list-element.component.{html,ts}",
    "./src/chat/create-chat/create-chat.component.{html,ts}",
    "./src/chat/chat-tab/chat-tab.component.{html,ts}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}