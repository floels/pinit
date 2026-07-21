import AccountDetailsFetcher from "./AccountDetailsFetcher";

// The access token is now refreshed by the navigation gate before the
// authenticated tree mounts (see NavigationContainer), so the only remaining
// authenticated-setup step is fetching the current account's details.
const AuthenticatedSetupBuilder = () => {
  return <AccountDetailsFetcher />;
};

export default AuthenticatedSetupBuilder;
