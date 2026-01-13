import { View, Button, Text } from "react-native";

export default function getRecordingLines({record}: {record: any}) {

    return (
      <View>
        <Text>
          Recording #1 | {record.duration ? (record.duration / 1000).toFixed(2) : 0} seconds
        </Text>
        <Button onPress={() => record.sound.replayAsync()} title="Reproduzir"></Button>
      </View>
    );

  }