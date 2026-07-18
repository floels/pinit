import {
  Dispatch,
  ReactNode,
  createContext,
  useContext,
  useReducer,
} from "react";

type State = {
  isCheckingAccessToken: boolean;
  isAuthenticated: boolean;
};

type Action = {
  type:
    | "FOUND_ACCESS_TOKEN"
    | "CHECKED_NO_ACCESS_TOKEN"
    | "LOGGED_IN"
    | "LOGGED_OUT"
    | "GOT_401_RESPONSE";
};

type ContextType = {
  state: State;
  dispatch: Dispatch<Action>;
};

const initialState = {
  isCheckingAccessToken: true,
  isAuthenticated: false,
};

export const AuthenticationContext = createContext<ContextType>({
  state: initialState,
  dispatch: () => {}, // placeholder function
});

const reducer = (state: State, action: Action) => {
  if (action.type === "FOUND_ACCESS_TOKEN") {
    return {
      isCheckingAccessToken: false,
      isAuthenticated: true,
    };
  }

  if (action.type === "CHECKED_NO_ACCESS_TOKEN") {
    return {
      isCheckingAccessToken: false,
      isAuthenticated: false,
    };
  }

  if (action.type === "LOGGED_IN") {
    return {
      isCheckingAccessToken: false,
      isAuthenticated: true,
    };
  }

  if (action.type === "LOGGED_OUT" || action.type === "GOT_401_RESPONSE") {
    return {
      isCheckingAccessToken: false,
      isAuthenticated: false,
    };
  }

  return state;
};

export const AuthenticationContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <AuthenticationContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthenticationContext.Provider>
  );
};

export const useAuthenticationContext = () => {
  const context = useContext(AuthenticationContext);

  if (context === undefined) {
    throw new Error(
      "'useAuthenticationContext' must be used within an AuthenticationContextProvider",
    );
  }

  return context;
};
