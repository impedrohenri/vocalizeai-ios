import { Audio } from 'expo-av';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function Timer({ isRecording, isPaused, recordingTime }: { isRecording: boolean, isPaused: boolean, recordingTime: number }) {

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs
            .toString()
            .padStart(2, "0")}`;
    };


    return (
        <>
            <View style={styles.timerSection}>
                <View style={styles.timerContainer}>
                    <Text style={styles.timerLabel}>Tempo de Gravação</Text>
                    <Text style={styles.timer}>{formatTime(recordingTime)}</Text>
                    {isRecording && !isPaused && (
                        <View style={styles.recordingIndicator}>
                            <View style={styles.recordingDot} />
                            <Text style={styles.recordingText}>Gravando</Text>
                        </View>
                    )}
                </View>
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    timerSection: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    timerContainer: {
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        padding: 32,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    timerLabel: {
        fontSize: 16,
        color: "#666",
        marginBottom: 8,
    },
    timer: {
        fontSize: 48,
        fontWeight: "700",
        color: "#2196F3",
        fontVariant: ["tabular-nums"],
    },
    recordingIndicator: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 16,
    },
    recordingDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: "#F44336",
        marginRight: 8,
    },
    recordingText: {
        color: "#F44336",
        fontSize: 14,
        fontWeight: "600",
    },
});