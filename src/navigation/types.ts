import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";

export type RootTabParamList = {
    Library: undefined;
    Player: undefined;
    Settings: undefined;
};

export type RootTabScreenProps<T extends keyof RootTabParamList> =
    BottomTabScreenProps<RootTabParamList, T>;

declare global {
    namespace ReactNavigation {
        interface RootParamList extends RootTabParamList {}
    }
}
