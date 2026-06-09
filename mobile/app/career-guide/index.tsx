import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, BookOpen, FileText, Briefcase, TrendingUp, Sparkles, Clock, ChevronRight } from 'lucide-react-native';

const GUIDES = [
  {
    title: "Mülakatlara Hazırlık Rehberi",
    description: "İK profesyonellerinin en çok sorduğu sorular, tuzak sorulara nasıl cevap verilir ve beden dili sırları.",
    icon: Briefcase,
    color: "#4F46E5",
    bgColor: "#EEF2FF",
    readTime: "12 Dk",
    slug: "mulakatlara-hazirlik"
  },
  {
    title: "Etkili CV Hazırlama Sanatı",
    description: "Yapay zeka tarama sistemlerini (ATS) nasıl geçersin? Öne çıkan bir özgeçmiş hazırlamanın altın kuralları.",
    icon: FileText,
    color: "#E11D48",
    bgColor: "#FFF1F2",
    readTime: "8 Dk",
    slug: "etkili-cv-hazirlama"
  },
  {
    title: "Maaş Müzakeresi Nasıl Yapılır?",
    description: "Hakkettiğin maaşı alabilmek için yapman gereken araştırmalar ve mülakat anında taktiksel konuşma adımları.",
    icon: TrendingUp,
    color: "#059669",
    bgColor: "#ECFDF5",
    readTime: "10 Dk",
    slug: "maas-muzakeresi"
  },
  {
    title: "Teknoloji Sektöründe Yükselmek",
    description: "Yazılım, Veri Bilimi ve Tasarım alanlarında kariyer basamaklarını hızla tırmanmak için öğrenmen gereken yetenekler.",
    icon: Sparkles,
    color: "#D97706",
    bgColor: "#FFFBEB",
    readTime: "15 Dk",
    slug: "teknoloji-sektorunde-yukselmek"
  }
];

export default function CareerGuideScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header Banner */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <View style={styles.badge}>
            <BookOpen size={14} color="#FFF" />
            <Text style={styles.badgeText}>Akademi</Text>
          </View>
          <Text style={styles.headerTitle}>Kariyer Rehberi</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageSubtitle}>
          Mülakat taktiklerinden CV hazırlamaya kadar ihtiyacın olan tüm rehberler burada.
        </Text>

        <View style={styles.list}>
          {GUIDES.map((guide, idx) => (
            <TouchableOpacity 
              key={idx}
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => router.push(`/career-guide/${guide.slug}` as any)}
            >
              <View style={styles.cardTop}>
                <View style={[styles.iconBox, { backgroundColor: guide.bgColor }]}>
                  <guide.icon size={24} color={guide.color} />
                </View>
                <View style={styles.readTimeBadge}>
                  <Clock size={12} color="#64748B" />
                  <Text style={styles.readTimeText}>{guide.readTime}</Text>
                </View>
              </View>

              <Text style={styles.title}>{guide.title}</Text>
              <Text style={styles.description}>{guide.description}</Text>

              <View style={styles.cardFooter}>
                <Text style={styles.readBtn}>Okumaya Başla</Text>
                <ChevronRight size={16} color="#4F46E5" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20,
    backgroundColor: '#0F172A',
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitleContainer: { alignItems: 'center' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 8 },
  badgeText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#FFF' },
  
  scrollContent: { padding: 20, paddingBottom: 100 },
  pageSubtitle: { fontSize: 16, color: '#64748B', lineHeight: 24, marginBottom: 24, textAlign: 'center', paddingHorizontal: 10 },
  
  list: { gap: 16 },
  card: {
    backgroundColor: '#FFF', borderRadius: 24, padding: 20,
    shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2,
    borderWidth: 1, borderColor: '#F1F5F9',
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  iconBox: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  readTimeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F8FAFC', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: '#F1F5F9' },
  readTimeText: { fontSize: 12, fontWeight: '700', color: '#64748B' },
  
  title: { fontSize: 20, fontWeight: '900', color: '#0F172A', marginBottom: 8 },
  description: { fontSize: 14, color: '#475569', lineHeight: 22, marginBottom: 16 },
  
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  readBtn: { fontSize: 15, fontWeight: '800', color: '#4F46E5' },
});
