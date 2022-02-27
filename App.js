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
  Platform,
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
  const [progress, setProgress] = useState(0);

  useEffect(async () => {
    const str = await AsyncStorage.getItem(STORAGE_LOCATION);
    if (str) {
      setWorking(JSON.parse(str));
    }
    loadToDos();
  }, []);
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_LOCATION, JSON.stringify(working));
  }, [working]);
  useEffect(() => {
    countProgress();
  }, [toDos, working]);
  const travel = () => setWorking(false);
  const work = () => setWorking(true);
  const onChangeText = (payload) => setText(payload);
  const countProgress = () => {
    if (working) {
      const totalWorkingArr = Object.values(toDos).filter((val) => val.working);
      const totalWorking = totalWorkingArr.length;
      const completed = totalWorkingArr.filter((arr) => arr.completed);
      const percentage = Math.round((completed.length / totalWorking) * 100);
      setProgress(percentage);
    } else {
      const totalTravelArr = Object.values(toDos).filter((val) => !val.working);
      const totalTravel = totalTravelArr.length;
      const completed = totalTravelArr.filter((arr) => arr.completed);
      const percentage = Math.round((completed.length / totalTravel) * 100);
      setProgress(percentage);
    }
  };
  const loadToDos = async () => {
    try {
      const str = await AsyncStorage.getItem(STORAGE_TODOS);
      if (str) {
        setToDos(JSON.parse(str));
      }
      setLoading(false);
    } catch (e) {
      console.log(e);
    }
  };
  const saveToDos = async (toSave) => {
    try {
      await AsyncStorage.setItem(STORAGE_TODOS, JSON.stringify(toSave));
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
    if (Platform.OS === "web") {
      const ok = confirm("Do you want to delete this todo?");
      if (ok) {
        const newToDos = { ...toDos };
        delete newToDos[id];
        setToDos(newToDos);
        saveToDos(newToDos);
      }
    } else {
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
    }
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
      <View style={styles.progressbarContainer}>
        <View style={styles.progressbar}>
          <View style={{ ...styles.innerProgress, width: `${progress}%` }} />
        </View>
        <Text style={styles.progressbarText}>{`${progress}%`}</Text>
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
                    <TouchableOpacity onPress={() => completeToDo(key)}>
                      <Fontisto name="check" size={18} color={theme.white} />
                    </TouchableOpacity>
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
                <View style={{ flexDirection: "row" }}>
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
                      marginLeft: 10,
                    }}
                  >
                    {toDos[key].text}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => deleteToDo(key)}>
                  <Fontisto name="trash" size={18} color={theme.white} />
                </TouchableOpacity>
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
  progressbarContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressbar: {
    height: 10,
    width: "80%",
    backgroundColor: theme.gray,
    marginVertical: 20,
    borderColor: theme.gray,
    borderRadius: 5,
  },
  progressbarText: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.white,
    marginLeft: 20,
  },
  innerProgress: {
    backgroundColor: "green",
    height: 10,
    borderRadius: 5,
  },
});
