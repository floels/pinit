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

type SessionEndReason = "user" | "expired";

type Action =
  | { type: "SESSION_RESTORED" }
  | { type: "SESSION_ABSENT" }
  | { type: "SESSION_STARTED" }
  | { type: "SESSION_ENDED"; reason?: SessionEndReason };

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
  if (action.type === "SESSION_RESTORED") {
    return {
      isCheckingAccessToken: false,
      isAuthenticated: true,
    };
  }

  if (action.type === "SESSION_ABSENT") {
    return {
      isCheckingAccessToken: false,
      isAuthenticated: false,
    };
  }

  if (action.type === "SESSION_STARTED") {
    return {
      isCheckingAccessToken: false,
      isAuthenticated: true,
    };
  }

  if (action.type === "SESSION_ENDED") {
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
