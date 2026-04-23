import {
  createContext,
  useContext,
  useReducer,
  Dispatch,
  ReactNode,
  useEffect,
} from "react";
import { useLocation, useSearchParams } from "react-router-dom";

type State = {
  inputValue: string;
  isInputFocused: boolean;
};

type Action =
  | { type: "SET_INPUT_VALUE"; payload: string }
  | { type: "FOCUS_INPUT" }
  | { type: "BLUR_INPUT" };

type HeaderSearchBarContextType = {
  state: State;
  dispatch: Dispatch<Action>;
};

const initialState = {
  inputValue: "",
  isInputFocused: false,
};

export const HeaderSearchBarContext = createContext<
  HeaderSearchBarContextType | undefined
>(undefined);

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case "SET_INPUT_VALUE":
      return { ...state, inputValue: action.payload };
    case "FOCUS_INPUT":
      return { ...state, isInputFocused: true };
    case "BLUR_INPUT":
      return { ...state, isInputFocused: false };
    default:
      return state;
  }
};

export const HeaderSearchBarContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();

  // Initialize the input value to the search param if present:
  useEffect(() => {
    if (pathname === "/en/search/pins") {
      const searchTerm = searchParams.get("q");
      if (searchTerm) {
        dispatch({ type: "SET_INPUT_VALUE", payload: searchTerm });
      }
    }
  }, [pathname, searchParams]);

  return (
    <HeaderSearchBarContext.Provider value={{ state, dispatch }}>
      {children}
    </HeaderSearchBarContext.Provider>
  );
};

export const useHeaderSearchBarContext = () => {
  const context = useContext(HeaderSearchBarContext);

  if (context === undefined) {
    throw new Error(
      "useHeaderSearchBarContext must be used within a HeaderSearchBarProvider",
    );
  }

  return context;
};
