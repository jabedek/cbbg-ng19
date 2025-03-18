/**
 * # 1.
 * Components `GameLobbyConfig`, `GameLobbyQuestions`, `GameLobbySeats`
 * emit values of their corresponding data part to parent component `GameCreateForm`.
 *
 *
 *
 * # 2.
 * Going from `GameCreateForm` component to `GamesLobby` service, new data is saved locally in `GamesLobby._currentlyCreatedGame` .
 *
 *
 *
 * # 3.
 * Next, a listener in `GamesLobby` service listens for changes in `_currentlyCreatedGame`,
 * and reacts to them by performing a remote update.
 *
 *
 *
 * # 4.
 * Then new updated object is fetched from server and stored in `_currentlyCreatedGame`.
 *
 *
 *
 * # 5.
 * Any change emission is debounced - starting with `GameLobby-[components]`, ending with `GamesLobby` service.
 */
const README = '';
