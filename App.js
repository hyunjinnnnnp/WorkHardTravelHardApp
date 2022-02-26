import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "./colors";
import { Fontisto } from "@expo/vector-icons";

const STORAGE_TODOS = "@toDos";
const STORAGE_LOCATION = "@location";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState("");
  const [editedText, setEditedText] = useState("");
  useEffect(async () => {
    const str = await AsyncStorage.getItem(STORAGE_LOCATION);
    setWorking(JSON.parse(str));
    loadToDos();
  }, []);
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_LOCATION, JSON.stringify(working));
  }, [working]);
  const travel = () => setWorking(false);
  const work = () => setWorking(true);
  const onChangeText = (payload) => setText(payload);
  const saveToDos = async (toSave) => {
    try {
      await AsyncStorage.setItem(STORAGE_TODOS, JSON.stringify(toSave));
    } catch (e) {
      console.log(e);
    }
  };
  const loadToDos = async () => {
    try {
      const str = await AsyncStorage.getItem(STORAGE_TODOS);
      setToDos(JSON.parse(str));
      setLoading(false);
    } catch (e) {
      console.log(e);
    }
  };

  const addToDo = async () => {
    if (text === "") {
      return;
    }
    const newToDos = {
      ...toDos,
      [Date.now()]: { text, working, completed: false },
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };
  const deleteToDo = (id) => {
    Alert.alert("Delete To Do", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "I'm Sure",
        style: "destructive", //ios only
        onPress: async () => {
          const newToDos = { ...toDos };
          delete newToDos[id];
          setToDos(newToDos);
          await saveToDos(newToDos);
        },
      },
    ]);
  };
  const completeToDo = async (id) => {
    const newToDos = { ...toDos };
    const completed = toDos[id].completed;
    newToDos[id].completed = !completed;
    setToDos(newToDos);
    await saveToDos(newToDos);
  };
  const onChangeEditedText = async (payload) => setEditedText(payload);
  const editToDo = async (id) => {
    const newToDos = { ...toDos };
    newToDos[id].text = editedText;
    setToDos(newToDos);
    await saveToDos(newToDos);
    setEditing("");
  };
  console.log(toDos);
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{
              ...styles.btnText,
              color: working ? theme.white : theme.gray,
            }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              ...styles.btnText,
              color: !working ? theme.white : theme.gray,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <TextInput
        onChangeText={onChangeText}
        value={text}
        onSubmitEditing={addToDo}
        returnKeyType="done"
        placeholder={
          working ? "What do you have to do?" : "What do you want to do?"
        }
        style={styles.input}
      />
      {loading ? (
        <ActivityIndicator
          color={theme.white}
          size="large"
          style={{ marginTop: 100 }}
        />
      ) : (
        <ScrollView>
          {Object.keys(toDos).map((key) =>
            toDos[key].working === working && !toDos[key].completed ? (
              <TouchableOpacity
                onPress={() => {
                  setEditing(key + "");
                  setEditedText(toDos[key].text + "");
                }}
                key={key}
              >
                {editing !== key + "" && (
                  <View
                    style={{ ...styles.toDo, backgroundColor: theme.gray }}
                    key={key}
                  >
                    <Text style={{ ...styles.toDoText, color: theme.white }}>
                      {toDos[key].text}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        width: "30%",
                        justifyContent: "space-around",
                      }}
                    >
                      <TouchableOpacity onPress={() => completeToDo(key)}>
                        <Fontisto name="check" size={18} color={theme.white} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => deleteToDo(key)}>
                        <Fontisto name="trash" size={18} color={theme.white} />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                {editing === key + "" && (
                  <TextInput
                    onChangeText={onChangeEditedText}
                    value={editedText}
                    onSubmitEditing={() => editToDo(key)}
                    returnKeyType="done"
                    placeholder={toDos[key].text}
                    style={styles.input}
                  />
                )}
              </TouchableOpacity>
            ) : null
          )}
          {Object.keys(toDos).map((key) =>
            toDos[key].working === working && toDos[key].completed ? (
              <View style={styles.toDo} key={key}>
                <Fontisto
                  name="checkbox-active"
                  size={18}
                  color={theme.green}
                />
                <Text
                  style={{
                    ...styles.toDoText,
                    color: theme.lightGray,
                    textDecorationLine: "line-through",
                  }}
                >
                  {toDos[key].text}
                </Text>
              </View>
            ) : null
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600",
  },
  input: {
    backgroundColor: theme.white,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
