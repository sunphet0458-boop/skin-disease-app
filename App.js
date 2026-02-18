import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Alert, SafeAreaView } from 'react-native';
import { NavigationContainer, useNavigation, useFocusEffect } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';

// --- Import ฟังก์ชันฐานข้อมูลจาก database.js ---
import { initDB, addScanRecord, getAllScans, deleteScanRecord } from './database';

// --- สีหลักของแอป (Theme Colors) ---
const COLORS = {
  primary: '#00a896',
  secondary: '#028074',
  background: '#F5F7FA',
  white: '#ffffff',
  textDark: '#1a237e',
  textGrey: '#666',
  danger: '#ff5252',
  warning: '#ff9800',
  success: '#4caf50',
  lightGreenBg: '#e0f2f1',
};

// --- คอมโพเนนต์ Header แบบกำหนดเอง ---
function CustomHeader({ title, showBack }) {
  const navigation = useNavigation();
  return (
    <View style={styles.customHeader}>
      {showBack ? (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
      ) : <View style={{ width: 24 }} />}
      <Text style={styles.headerTitleText}>{title}</Text>
      <View style={{ width: 24 }} />
    </View>
  );
}

// --- หน้า 1: Home (หน้าหลัก) ---
function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.homeHeaderRow}>
          <View>
            <Text style={styles.greetingText}>Hi, Sarah 👋</Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity style={styles.iconButton}><Ionicons name="notifications-outline" size={24} color={COLORS.textDark} /></TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}><Ionicons name="person-circle-outline" size={28} color={COLORS.textDark} /></TouchableOpacity>
          </View>
        </View>

        <View style={styles.dashboardCard}>
          <Text style={styles.dashboardTitle}>Your Health Dashboard</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>24</Text>
              <Text style={styles.statLabel}>Total Scans</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>89%</Text>
              <Text style={styles.statLabel}>Accuracy Rate</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.mainActionButton} onPress={() => navigation.navigate('Upload')}>
          <Ionicons name="camera" size={24} color={COLORS.white} style={{ marginRight: 10 }} />
          <Text style={styles.mainActionButtonText}>Start New Analysis</Text>
        </TouchableOpacity>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Scans</Text>
          <TouchableOpacity onPress={() => navigation.navigate('HistoryTab')}><Text style={{ color: COLORS.primary }}>View All</Text></TouchableOpacity>
        </View>

        {/* ส่วนแสดงรายการล่าสุดแบบ Hardcode ไว้ก่อน (หรือจะแก้ให้ดึง DB ก็ได้) */}
        <TouchableOpacity style={styles.listItem} onPress={() => navigation.navigate('HistoryTab')}>
          <View style={[styles.iconBox, { backgroundColor: '#b2dfdb' }]}></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.listTitle}>Benign Keratosis</Text>
            <Text style={styles.listSub}>Recent Scan</Text>
          </View>
          <View style={{ alignItems: 'flex-end', marginRight: 10 }}>
            <Text style={{ color: COLORS.success, fontWeight: 'bold' }}>92%</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// --- หน้า 2: Upload (เลือกรูป + กล้องถ่ายรูป) ---
function UploadScreen({ navigation }) {
  const [image, setImage] = useState(null);

  useEffect(() => {
    (async () => {
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (cameraStatus.status !== 'granted' || galleryStatus.status !== 'granted') {
        Alert.alert('ต้องการสิทธิ์', 'กรุณาอนุญาตให้เข้าถึงกล้องและคลังภาพเพื่อใช้งานหน้านี้');
      }
    })();
  }, []);

  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    handleImageResult(result);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    handleImageResult(result);
  };

  const handleImageResult = (result) => {
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader title="Upload Skin Image" showBack={true} />
      <View style={styles.container}>

        <View style={styles.uploadContainer}>
          <TouchableOpacity style={styles.uploadOptionBtn} onPress={takePhoto}>
            <View style={[styles.iconCircle, { backgroundColor: '#e0f2f1' }]}>
              <Ionicons name="camera" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.uploadBtnText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.uploadOptionBtn} onPress={pickImage}>
            <View style={[styles.iconCircle, { backgroundColor: '#e3f2fd' }]}>
              <Ionicons name="image" size={32} color="#1976d2" />
            </View>
            <Text style={styles.uploadBtnText}>Choose from Gallery</Text>
          </TouchableOpacity>
        </View>

        {image && (
          <View style={styles.previewContainer}>
            <Image source={{ uri: image }} style={styles.previewImage} />
            <TouchableOpacity style={styles.closePreviewBtn} onPress={() => setImage(null)}>
              <Ionicons name="close-circle" size={24} color={COLORS.danger} />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.tipsBox}>
          <MaterialCommunityIcons name="lightbulb-on-outline" size={24} color={COLORS.primary} style={{ marginRight: 10 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: 'bold', color: COLORS.textDark }}>Tips for Best Results:</Text>
            <Text style={{ color: COLORS.textGrey, fontSize: 13 }}>Good lighting, clear focus, close-up shot</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.mainActionButton, { marginTop: 'auto', marginBottom: 20, opacity: image ? 1 : 0.5 }]}
          disabled={!image}
          onPress={() => navigation.navigate('Result', { imageUri: image })}
        >
          <Text style={styles.mainActionButtonText}>Analyze Image</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// --- หน้า 3: Result (แสดงผล + บันทึกข้อมูล) ---
function ResultScreen({ route, navigation }) {
  const { imageUri } = route.params || {};
  const confidenceValue = 87;
  const diagnosisResult = "Melanoma"; // สมมติผลลัพธ์
  const riskLevelResult = "High Risk"; // สมมติระดับความเสี่ยง

  // --- ฟังก์ชันบันทึกข้อมูลลงฐานข้อมูล (CREATE) ---
  const handleSaveResult = () => {
    const success = addScanRecord(imageUri, diagnosisResult, riskLevelResult, confidenceValue);
    if (success) {
      Alert.alert(
        "บันทึกสำเร็จ",
        "ข้อมูลถูกบันทึกเรียบร้อยแล้ว",
        [{ text: "OK", onPress: () => navigation.navigate('HistoryTab') }]
      );
    } else {
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถบันทึกข้อมูลได้");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader title="Analysis Results" showBack={true} />
      <ScrollView style={styles.container}>

        {imageUri && <Image source={{ uri: imageUri }} style={styles.resultImagePreview} />}

        <View style={styles.mainResultCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.resultTitle}>{diagnosisResult}</Text>
            <View style={styles.riskBadge}>
              <Text style={styles.riskBadgeText}>{riskLevelResult}</Text>
            </View>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: COLORS.primary }}>{confidenceValue}%</Text>
            <Text style={{ fontSize: 12, color: COLORS.textGrey }}>Confidence</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Top 3 Predictions</Text>

        <View style={styles.predictionItem}>
          <Text style={{ flex: 1, fontWeight: '500' }}>Melanoma</Text>
          <View style={styles.progressBarBg}><View style={[styles.progressBarFill, { width: '87%', backgroundColor: COLORS.primary }]} /></View>
          <Text style={{ fontWeight: 'bold', marginLeft: 10 }}>87%</Text>
        </View>
        <View style={styles.predictionItem}>
          <Text style={{ flex: 1, fontWeight: '500' }}>Basal Cell Carcinoma</Text>
          <View style={styles.progressBarBg}><View style={[styles.progressBarFill, { width: '8%', backgroundColor: COLORS.primary }]} /></View>
          <Text style={{ fontWeight: 'bold', marginLeft: 10 }}>8%</Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 30, marginBottom: 20 }}>
          <TouchableOpacity style={[styles.mainActionButton, { flex: 1, marginRight: 10, marginHorizontal: 0 }]} onPress={() => navigation.navigate('Detail')}>
            <Text style={styles.mainActionButtonText}>View Full Report</Text>
          </TouchableOpacity>

          {/* ปุ่มบันทึกผล */}
          <TouchableOpacity
            style={[styles.outlineButton, { flex: 1, marginLeft: 10 }]}
            onPress={handleSaveResult}
          >
            <Text style={styles.outlineButtonText}>Save Result</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- หน้า 4: Detail (รายละเอียด) ---
function DetailScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader title="Melanoma" showBack={true} />
      <ScrollView style={[styles.container, { backgroundColor: COLORS.white }]}>
        <View style={styles.detailImagePlaceholder}>
          <Ionicons name="document-text-outline" size={50} color="#ccc" />
        </View>

        <View style={styles.detailSection}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <Ionicons name="information-circle-outline" size={24} color={COLORS.primary} style={{ marginRight: 5 }} />
            <Text style={styles.detailSectionTitle}>What is it?</Text>
          </View>
          <Text style={styles.detailText}>
            Melanoma is the most serious type of skin cancer. It develops in the cells that produce melanin (skin pigment). Early detection is crucial.
          </Text>
        </View>

        <View style={styles.warningBox}>
          <Ionicons name="warning-outline" size={24} color={COLORS.warning} style={{ marginRight: 10 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: 'bold', color: COLORS.textDark }}>When to See a Doctor</Text>
            <Text style={{ color: COLORS.textGrey, fontSize: 13, marginTop: 5 }}>Consult a dermatologist immediately if you notice changes.</Text>
          </View>
        </View>

        <TouchableOpacity style={[styles.mainActionButton, { backgroundColor: COLORS.warning, marginTop: 20, marginBottom: 30 }]}>
          <FontAwesome5 name="map-marker-alt" size={18} color={COLORS.white} style={{ marginRight: 10 }} />
          <Text style={styles.mainActionButtonText}>Find Dermatologist Near Me</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- หน้า 5: History (ประวัติ - ดึงจากฐานข้อมูล READ/DELETE) ---
function HistoryScreen() {
  const [historyData, setHistoryData] = useState([]);

  // ดึงข้อมูลใหม่ทุกครั้งที่เข้ามาหน้านี้ (READ)
  useFocusEffect(
    useCallback(() => {
      const data = getAllScans();
      setHistoryData(data);
    }, [])
  );

  // ฟังก์ชันลบข้อมูล (DELETE)
  const handleDeleteItem = (id) => {
    Alert.alert(
      "ยืนยันการลบ",
      "คุณต้องการลบประวัตินี้ใช่หรือไม่?",
      [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: "ลบ",
          style: "destructive",
          onPress: () => {
            deleteScanRecord(id);
            setHistoryData(getAllScans()); // โหลดข้อมูลใหม่
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Your Records</Text>
        <View style={{ flexDirection: 'row', marginBottom: 20 }}>
          <View style={[styles.filterTab, { backgroundColor: COLORS.primary }]}><Text style={{ color: COLORS.white, fontWeight: 'bold' }}>All</Text></View>
          <View style={styles.filterTab}><Text style={{ color: COLORS.textGrey }}>High Risk</Text></View>
          <View style={styles.filterTab}><Text style={{ color: COLORS.textGrey }}>Recent</Text></View>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          {historyData.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 50 }}>
              <Text style={{ color: COLORS.textGrey }}>ไม่มีประวัติการสแกน</Text>
            </View>
          ) : (
            historyData.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.listItem}
                onLongPress={() => handleDeleteItem(item.id)} // กดค้างเพื่อลบ
              >
                <Image source={{ uri: item.imageUri }} style={[styles.iconBox, { backgroundColor: '#e0e0e0' }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.listTitle}>{item.diagnosis}</Text>
                  <Text style={styles.listSub}>
                    {new Date(item.date).toLocaleDateString()} • {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  <Text style={{
                    color: item.riskLevel === 'High Risk' ? COLORS.danger : COLORS.success,
                    fontWeight: 'bold',
                    fontSize: 12
                  }}>
                    {item.confidence}% {item.riskLevel}
                  </Text>
                </View>
                <Ionicons name="trash-outline" size={20} color="#ccc" />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function PlaceholderScreen({ title }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20, color: COLORS.textGrey }}>{title} Coming Soon!</Text>
    </View>
  );
}

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Upload" component={UploadScreen} />
      <Stack.Screen name="Result" component={ResultScreen} />
      <Stack.Screen name="Detail" component={DetailScreen} />
    </Stack.Navigator>
  );
}

function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'HomeTab') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'HistoryTab') iconName = focused ? 'time' : 'time-outline';
          else if (route.name === 'InfoTab') iconName = focused ? 'information-circle' : 'information-circle-outline';
          else if (route.name === 'ProfileTab') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textGrey,
        tabBarStyle: { height: 60, paddingBottom: 10, paddingTop: 10, borderTopLeftRadius: 20, borderTopRightRadius: 20, position: 'absolute', bottom: 0, left: 0, right: 0, elevation: 0, backgroundColor: COLORS.white, borderTopWidth: 0, shadowColor: "#000", shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 3 },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' }
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStackNavigator} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="HistoryTab" component={HistoryScreen} options={{ tabBarLabel: 'History' }} />
      <Tab.Screen name="InfoTab" component={PlaceholderScreen} initialParams={{ title: 'Info' }} options={{ tabBarLabel: 'Info' }} />
      <Tab.Screen name="ProfileTab" component={PlaceholderScreen} initialParams={{ title: 'Profile' }} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  // สร้างตารางฐานข้อมูลเมื่อเปิดแอปครั้งแรก
  useEffect(() => {
    initDB();
  }, []);

  return (
    <NavigationContainer>
      <AppTabs />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, padding: 20 },
  customHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: COLORS.background },
  backButton: { padding: 5 },
  headerTitleText: { fontSize: 20, fontWeight: 'bold', color: COLORS.textDark },
  homeHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 10 },
  greetingText: { fontSize: 24, fontWeight: 'bold', color: COLORS.textDark },
  iconButton: { padding: 5, marginLeft: 10, backgroundColor: COLORS.white, borderRadius: 50, padding: 8 },
  dashboardCard: { backgroundColor: COLORS.primary, borderRadius: 25, padding: 25, marginBottom: 25 },
  dashboardTitle: { color: COLORS.white, fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statBox: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 15, padding: 15, width: '48%', alignItems: 'center' },
  statNumber: { color: COLORS.white, fontSize: 28, fontWeight: 'bold' },
  statLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 14 },
  mainActionButton: { backgroundColor: COLORS.primary, paddingVertical: 18, borderRadius: 30, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginHorizontal: 20, elevation: 3, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5 },
  mainActionButtonText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 25, marginBottom: 15 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.textDark },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: COLORS.textDark, marginBottom: 20, marginTop: 10 },
  listItem: { backgroundColor: COLORS.white, padding: 15, borderRadius: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 12, elevation: 1 },
  iconBox: { width: 50, height: 50, borderRadius: 15, marginRight: 15 },
  listTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.textDark },
  listSub: { fontSize: 13, color: COLORS.textGrey, marginTop: 4 },
  uploadContainer: { backgroundColor: COLORS.white, borderRadius: 25, padding: 30, alignItems: 'center', borderStyle: 'dashed', borderWidth: 2, borderColor: '#e0e0e0', marginBottom: 20 },
  uploadOptionBtn: { alignItems: 'center', marginVertical: 15, width: '100%' },
  iconCircle: { width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  uploadBtnText: { fontSize: 16, fontWeight: '600', color: COLORS.textDark },
  previewContainer: { alignItems: 'center', marginBottom: 20, position: 'relative' },
  previewImage: { width: 200, height: 200, borderRadius: 20 },
  closePreviewBtn: { position: 'absolute', top: -10, right: -10, backgroundColor: COLORS.white, borderRadius: 50 },
  tipsBox: { backgroundColor: COLORS.lightGreenBg, padding: 15, borderRadius: 15, flexDirection: 'row', alignItems: 'center' },
  resultImagePreview: { width: '100%', height: 220, borderRadius: 25, marginBottom: 25, backgroundColor: '#e0e0e0' },
  mainResultCard: { backgroundColor: COLORS.white, borderRadius: 25, padding: 25, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2, marginBottom: 30 },
  resultTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.textDark },
  riskBadge: { backgroundColor: COLORS.danger, paddingHorizontal: 15, paddingVertical: 6, borderRadius: 20, marginTop: 10, alignSelf: 'flex-start' },
  riskBadgeText: { color: COLORS.white, fontWeight: 'bold', fontSize: 14 },
  predictionItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  progressBarBg: { flex: 2, height: 8, backgroundColor: '#e0e0e0', borderRadius: 5, marginHorizontal: 10 },
  progressBarFill: { height: '100%', borderRadius: 5 },
  outlineButton: { backgroundColor: 'transparent', borderWidth: 2, borderColor: COLORS.primary, paddingVertical: 18, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  outlineButtonText: { color: COLORS.primary, fontSize: 18, fontWeight: 'bold' },
  detailImagePlaceholder: { height: 180, backgroundColor: '#e0e0e0', borderRadius: 20, marginBottom: 25, justifyContent: 'center', alignItems: 'center' },
  detailSection: { marginBottom: 25 },
  detailSectionTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.textDark },
  detailText: { fontSize: 16, color: COLORS.textGrey, lineHeight: 24 },
  symptomItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  warningBox: { backgroundColor: '#fff3e0', padding: 20, borderRadius: 20, flexDirection: 'row', borderLeftWidth: 5, borderLeftColor: COLORS.warning },
  filterTab: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, marginRight: 10, backgroundColor: '#e0e0e0' },
});