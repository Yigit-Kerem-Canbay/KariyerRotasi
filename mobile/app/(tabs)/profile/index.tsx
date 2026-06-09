import { isAxiosError } from 'axios';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, Dimensions, Modal, TextInput, Switch, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuthStore } from '@/store/auth';
import api from '@/api/client';
import { User, Mail, Phone, Settings, MapPin, Briefcase, GraduationCap, Award, FileText, Upload, ChevronRight, LogOut, CheckCircle, Edit2, ExternalLink, Trash2, Folder, Plus, Calendar } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as Linking from 'expo-linking';

import { getApiBaseUrl, absolutizeUploadPath } from '@/lib/config';
import { theme } from '@/lib/theme';

const renderYear = (d: string | null | undefined) => {
  if (!d) return '';
  return new Date(d).getFullYear();
};

export default function ProfileScreen() {
  const { user, setUser, clear } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  // Modal and Edit states
  const [editModal, setEditModal] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  // Form states
  const [aboutText, setAboutText] = useState('');
  const [eduForm, setEduForm] = useState({ school: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', isContinuing: false, grade: '' });
  const [expForm, setExpForm] = useState({ company: '', title: '', location: '', startDate: '', endDate: '', isContinuing: false, description: '' });
  const [projForm, setProjForm] = useState({ name: '', description: '', url: '', technologies: '', startDate: '', endDate: '', isContinuing: false });
  const [certForm, setCertForm] = useState({ name: '', issuer: '', issueDate: '', expirationDate: '', credentialUrl: '' });
  const [langForm, setLangForm] = useState({ language: '', level: '' });
  const [skillForm, setSkillForm] = useState({ skillName: '' });
  const [prefForm, setPrefForm] = useState({ salaryMin: '', currency: 'TRY', workModels: '', preferredCities: '', preferredWorkingHours: '', employmentTypes: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/me');
      setUser(res.data);
    } catch (error) {
      console.error('Failed to fetch profile', error);
      if (isAxiosError(error) && error.response?.status === 401) {
        await clear();
        router.replace('/(auth)/login' as any);
      } else {
        Alert.alert('Hata', 'Profil bilgileri alınamadı.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert("İzin Gerekli", "Fotoğraf yüklemek için galeri erişim iznine ihtiyacımız var.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setUploading(true);
        const asset = result.assets[0];
        
        const localUri = asset.uri;
        const filename = localUri.split('/').pop() || 'avatar.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;

        const formData = new FormData();
        // @ts-ignore
        formData.append('file', { uri: localUri, name: filename, type });

        const token = useAuthStore.getState().token;
        const url = `${getApiBaseUrl()}/users/me/avatar`;

        const res = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData,
        });
        
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Profil fotoğrafı güncellenemedi.');
        }

        if (data.user) setUser(data.user);
        Alert.alert('Başarılı', 'Profil fotoğrafınız güncellendi.');
      }
    } catch (error: any) {
      console.error('Avatar Error:', error);
      Alert.alert('Hata', error.message || 'Profil fotoğrafı güncellenemedi.');
    } finally {
      setUploading(false);
    }
  };

  const handleCvUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setUploading(true);
        const asset = result.assets[0];

        const formData = new FormData();
        // @ts-ignore
        formData.append('file', {
          uri: asset.uri,
          name: asset.name || 'cv.pdf',
          type: 'application/pdf',
        });

        const token = useAuthStore.getState().token;
        const url = `${getApiBaseUrl()}/users/me/upload-cv`;

        const res = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'CV yüklenemedi.');
        }

        if (data.user) setUser(data.user);
        
        if (data.mergePreview) {
          Alert.alert('Yapay Zeka', 'CV\'niz başarıyla okundu. Otomatik birleştirme tamamlandı.', [{ text: 'Tamam' }]);
        } else {
          Alert.alert('Başarılı', 'CV başarıyla yüklendi.');
        }
      }
    } catch (error: any) {
      console.error('Upload Error:', error);
      Alert.alert('Hata', error.message || 'CV yüklenemedi. Lütfen tekrar deneyin.');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Çıkış Yap', 'Hesabınızdan çıkış yapmak istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Çıkış Yap', style: 'destructive', onPress: () => {
        clear();
        router.replace('/(auth)/login' as any);
      }}
    ]);
  };

  const handleOpenCV = () => {
    if (!user?.cvUrl) return;
    const url = absolutizeUploadPath(user.cvUrl);
    Linking.openURL(url).catch(() => Alert.alert('Hata', 'CV açılamadı.'));
  };

  const handleDeleteCV = async () => {
    Alert.alert('Emin misiniz?', 'Özgeçmişinizi silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: async () => {
        try {
          await api.delete('/users/me/cv');
          const { data } = await api.get('/users/me');
          setUser(data);
          Alert.alert('Başarılı', 'Özgeçmişiniz silindi.');
        } catch (e) {
          Alert.alert('Hata', 'CV silinemedi.');
        }
      }}
    ]);
  };

  const handleDelete = async (type: string, id: string) => {
    Alert.alert('Emin misiniz?', 'Bu öğeyi silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: async () => {
        try {
          let endpoint = "";
          switch (type) {
            case "education": endpoint = `/users/me/education/${id}`; break;
            case "experience": endpoint = `/users/me/experience/${id}`; break;
            case "project": endpoint = `/users/me/project/${id}`; break;
            case "certification": endpoint = `/users/me/certification/${id}`; break;
            case "language": endpoint = `/users/me/language/${id}`; break;
            case "skill": endpoint = `/users/me/skill/${id}`; break;
            default: return;
          }
          const res = await api.delete(endpoint);
          setUser(res.data);
          Alert.alert('Başarılı', 'Öğe başarıyla silindi.');
        } catch {
          Alert.alert('Hata', 'Silme işlemi sırasında bir hata oluştu.');
        }
      }}
    ]);
  };

  const handleSaveAbout = async () => {
    try {
      const res = await api.patch("/users/me/profile", { about: aboutText });
      setUser(res.data);
      setEditModal(null);
    } catch {
      Alert.alert('Hata', 'Hakkımda kaydedilemedi.');
    }
  };

  const handleSaveEducation = async () => {
    try {
      const payload = {
        ...eduForm,
        endDate: eduForm.isContinuing ? null : (eduForm.endDate || null),
        grade: eduForm.grade || null
      };
      let res;
      if (editId) {
        res = await api.patch(`/users/me/education/${editId}`, payload);
      } else {
        res = await api.post("/users/me/education", payload);
      }
      setUser(res.data);
      setEditModal(null);
      setEditId(null);
    } catch {
      Alert.alert('Hata', 'Eğitim kaydedilemedi.');
    }
  };

  const handleSaveExperience = async () => {
    try {
      const payload = {
        ...expForm,
        endDate: expForm.isContinuing ? null : (expForm.endDate || null),
        location: expForm.location || null,
        description: expForm.description || null
      };
      let res;
      if (editId) {
        res = await api.patch(`/users/me/experience/${editId}`, payload);
      } else {
        res = await api.post("/users/me/experience", payload);
      }
      setUser(res.data);
      setEditModal(null);
      setEditId(null);
    } catch {
      Alert.alert('Hata', 'Deneyim kaydedilemedi.');
    }
  };

  const handleSaveProject = async () => {
    try {
      const payload = {
        ...projForm,
        technologies: projForm.technologies ? projForm.technologies.split(",").map(s => s.trim()).filter(Boolean) : [],
        endDate: projForm.isContinuing ? null : (projForm.endDate || null),
        startDate: projForm.startDate || null,
        url: projForm.url || null,
        description: projForm.description || null
      };
      let res;
      if (editId) {
        res = await api.patch(`/users/me/project/${editId}`, payload);
      } else {
        res = await api.post("/users/me/project", payload);
      }
      setUser(res.data);
      setEditModal(null);
      setEditId(null);
    } catch {
      Alert.alert('Hata', 'Proje kaydedilemedi.');
    }
  };

  const handleSaveCertification = async () => {
    try {
      const payload = {
        ...certForm,
        issueDate: certForm.issueDate || null,
        expirationDate: certForm.expirationDate || null,
        credentialUrl: certForm.credentialUrl || null,
        issuer: certForm.issuer || null
      };
      let res;
      if (editId) {
        res = await api.patch(`/users/me/certification/${editId}`, payload);
      } else {
        res = await api.post("/users/me/certification", payload);
      }
      setUser(res.data);
      setEditModal(null);
      setEditId(null);
    } catch {
      Alert.alert('Hata', 'Sertifika kaydedilemedi.');
    }
  };

  const handleSaveLanguage = async () => {
    try {
      let res;
      if (editId) {
        res = await api.patch(`/users/me/language/${editId}`, langForm);
      } else {
        res = await api.post("/users/me/language", langForm);
      }
      setUser(res.data);
      setEditModal(null);
      setEditId(null);
    } catch {
      Alert.alert('Hata', 'Dil kaydedilemedi.');
    }
  };

  const handleSaveSkill = async () => {
    if (!skillForm.skillName.trim()) return;
    try {
      const res = await api.post("/users/me/skill", { skillName: skillForm.skillName.trim() });
      setUser(res.data);
      setEditModal(null);
      setSkillForm({ skillName: "" });
    } catch {
      Alert.alert('Hata', 'Yetenek kaydedilemedi.');
    }
  };

  const handleSavePref = async () => {
    try {
      const payload = {
        salaryMin: prefForm.salaryMin ? Number(prefForm.salaryMin) : null,
        currency: prefForm.currency || "TRY",
        workModels: prefForm.workModels ? prefForm.workModels.split(",").map(s => s.trim()).filter(Boolean) : [],
        preferredCities: prefForm.preferredCities ? prefForm.preferredCities.split(",").map(s => s.trim()).filter(Boolean) : [],
        preferredWorkingHours: prefForm.preferredWorkingHours ? prefForm.preferredWorkingHours.split(",").map(s => s.trim()).filter(Boolean) : [],
        employmentTypes: prefForm.employmentTypes ? prefForm.employmentTypes.split(",").map(s => s.trim()).filter(Boolean) : [],
      };
      const res = await api.patch("/users/me/preferences", payload);
      setUser(res.data);
      setEditModal(null);
    } catch {
      Alert.alert('Hata', 'Tercihler kaydedilemedi.');
    }
  };

  if (loading || !user) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  const avatarSource = user.avatarUrl 
    ? { uri: absolutizeUploadPath(user.avatarUrl) }
    : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.headerBackground} />
        
        <View style={styles.profileSection}>
          <TouchableOpacity onPress={handleAvatarUpload} disabled={uploading} style={styles.avatarContainer}>
            {avatarSource ? (
              <Image source={avatarSource} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <View style={styles.editAvatarBadge}>
              <Edit2 size={14} color="#FFF" />
            </View>
          </TouchableOpacity>
          
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.title}>{user.profile?.title || 'Unvan Belirtilmemiş'}</Text>
          
          {user.profileCompletionScore !== undefined && (
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreText}>Profil Doluluğu: %{typeof user.profileCompletionScore === 'object' ? (user.profileCompletionScore as any).score : user.profileCompletionScore}</Text>
              <View style={styles.scoreBarBg}>
                <View style={[styles.scoreBarFill, { width: `${typeof user.profileCompletionScore === 'object' ? (user.profileCompletionScore as any).score : user.profileCompletionScore}%` }]} />
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.editProfileBtn} onPress={() => router.push('/profile/edit' as any)}>
            <Edit2 size={16} color="#4F46E5" />
            <Text style={styles.editProfileTxt}>Profili Düzenle</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        
        {/* Contact Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>İletişim & Konum</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.iconBg}><Mail size={16} color="#4F46E5" /></View>
            <Text style={styles.infoText}>{user.email}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.iconBg}><Phone size={16} color="#4F46E5" /></View>
            <Text style={styles.infoText}>{user.profile?.phone || user.phone || 'Eklenmemiş'}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.iconBg}><MapPin size={16} color="#4F46E5" /></View>
            <Text style={styles.infoText}>
              {user.profile?.city ? `${user.profile.city}${user.profile.district ? `, ${user.profile.district}` : ''}` : 'Eklenmemiş'}
            </Text>
          </View>
        </View>

        {/* Personal Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Kişisel Bilgiler & Sosyal Medya</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.iconBg}><Calendar size={16} color="#4F46E5" /></View>
            <Text style={styles.infoText}>Doğum Tarihi: {user.profile?.birthDate ? new Date(user.profile.birthDate).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.iconBg}><User size={16} color="#4F46E5" /></View>
            <Text style={styles.infoText}>Cinsiyet: {user.profile?.gender || 'Belirtilmemiş'}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.iconBg}><Award size={16} color="#4F46E5" /></View>
            <Text style={styles.infoText}>Askerlik Durumu: {user.profile?.militaryStatus || 'Belirtilmemiş'}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.iconBg}><FileText size={16} color="#4F46E5" /></View>
            <Text style={styles.infoText}>Sürücü Belgesi: {user.profile?.driverLicense || 'Belirtilmemiş'}</Text>
          </View>

          {user.profile?.linkedinUrl ? (
            <TouchableOpacity style={styles.infoRow} onPress={() => Linking.openURL(user.profile!.linkedinUrl!)}>
              <View style={styles.iconBg}><ExternalLink size={16} color="#4F46E5" /></View>
              <Text style={[styles.infoText, { color: '#4F46E5', fontWeight: '700' }]}>LinkedIn Profili</Text>
            </TouchableOpacity>
          ) : null}

          {user.profile?.githubUrl ? (
            <TouchableOpacity style={styles.infoRow} onPress={() => Linking.openURL(user.profile!.githubUrl!)}>
              <View style={styles.iconBg}><ExternalLink size={16} color="#4F46E5" /></View>
              <Text style={[styles.infoText, { color: '#4F46E5', fontWeight: '700' }]}>GitHub Profili</Text>
            </TouchableOpacity>
          ) : null}

          {user.profile?.portfolioUrl ? (
            <TouchableOpacity style={styles.infoRow} onPress={() => Linking.openURL(user.profile!.portfolioUrl!)}>
              <View style={styles.iconBg}><ExternalLink size={16} color="#4F46E5" /></View>
              <Text style={[styles.infoText, { color: '#4F46E5', fontWeight: '700' }]}>Portfolyo Web Sitesi</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* 1. Hakkımda Section */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Hakkında</Text>
            <TouchableOpacity onPress={() => { setAboutText(user.profile?.about || ''); setEditModal('about'); }}>
              <Edit2 size={18} color="#4F46E5" />
            </TouchableOpacity>
          </View>
          {user.profile?.about ? (
            <Text style={styles.descText}>{user.profile.about}</Text>
          ) : (
            <Text style={styles.emptyText}>Hakkında bilgisi eklenmemiş.</Text>
          )}
        </View>

        {/* 2. Eğitim Section */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Eğitim</Text>
            <TouchableOpacity onPress={() => { setEditId(null); setEduForm({ school: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', isContinuing: false, grade: '' }); setEditModal('education'); }}>
              <Plus size={20} color="#4F46E5" />
            </TouchableOpacity>
          </View>
          {user.education && user.education.length > 0 ? (
            user.education.map((edu: any, index: number) => (
              <View key={edu.id} style={[styles.itemRow, index !== user.education!.length - 1 && styles.borderBottom]}>
                <View style={styles.itemIconWrap}><GraduationCap size={20} color="#6366F1" /></View>
                <View style={styles.itemContent}>
                  <Text style={styles.itemTitle}>{edu.school}</Text>
                  <Text style={styles.itemSubtitle}>{edu.degree} • {edu.fieldOfStudy}</Text>
                  <Text style={styles.itemDate}>
                    {renderYear(edu.startDate)} - {edu.isContinuing ? 'Devam Ediyor' : renderYear(edu.endDate)}
                  </Text>
                  {edu.grade ? <Text style={[styles.itemDate, { marginTop: 4, color: '#4F46E5', fontWeight: '600' }]}>Not Ortalaması: {edu.grade}</Text> : null}
                </View>
                <View style={styles.itemActions}>
                  <TouchableOpacity onPress={() => { setEditId(edu.id); setEduForm({ school: edu.school, degree: edu.degree, fieldOfStudy: edu.fieldOfStudy, startDate: edu.startDate?.substring(0, 10), endDate: edu.endDate?.substring(0, 10) || '', isContinuing: edu.isContinuing, grade: edu.grade || '' }); setEditModal('education'); }}>
                    <Edit2 size={16} color="#64748B" style={{ marginRight: 12 }} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete('education', edu.id)}>
                    <Trash2 size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Eğitim bilgisi eklenmemiş.</Text>
          )}
        </View>

        {/* 3. Deneyim Section */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Deneyim</Text>
            <TouchableOpacity onPress={() => { setEditId(null); setExpForm({ company: '', title: '', location: '', startDate: '', endDate: '', isContinuing: false, description: '' }); setEditModal('experience'); }}>
              <Plus size={20} color="#4F46E5" />
            </TouchableOpacity>
          </View>
          {user.experience && user.experience.length > 0 ? (
            user.experience.map((exp: any, index: number) => (
              <View key={exp.id} style={[styles.itemRow, index !== user.experience!.length - 1 && styles.borderBottom]}>
                <View style={styles.itemIconWrap}><Briefcase size={20} color="#6366F1" /></View>
                <View style={styles.itemContent}>
                  <Text style={styles.itemTitle}>{exp.title}</Text>
                  <Text style={styles.itemSubtitle}>{exp.companyName || exp.company} {exp.location ? `• ${exp.location}` : ''}</Text>
                  <Text style={styles.itemDate}>
                    {renderYear(exp.startDate)} - {exp.isCurrent || exp.isContinuing ? 'Devam Ediyor' : renderYear(exp.endDate)}
                  </Text>
                  {exp.description ? <Text style={[styles.descText, { fontSize: 13, marginTop: 6 }]} numberOfLines={3}>{exp.description}</Text> : null}
                </View>
                <View style={styles.itemActions}>
                  <TouchableOpacity onPress={() => { setEditId(exp.id); setExpForm({ company: exp.company, title: exp.title, location: exp.location || '', startDate: exp.startDate?.substring(0, 10), endDate: exp.endDate?.substring(0, 10) || '', isContinuing: exp.isContinuing || exp.isCurrent || false, description: exp.description || '' }); setEditModal('experience'); }}>
                    <Edit2 size={16} color="#64748B" style={{ marginRight: 12 }} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete('experience', exp.id)}>
                    <Trash2 size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>İş deneyimi eklenmemiş.</Text>
          )}
        </View>

        {/* 4. Projeler Section */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Projeler</Text>
            <TouchableOpacity onPress={() => { setEditId(null); setProjForm({ name: '', description: '', url: '', technologies: '', startDate: '', endDate: '', isContinuing: false }); setEditModal('project'); }}>
              <Plus size={20} color="#4F46E5" />
            </TouchableOpacity>
          </View>
          {user.projects && user.projects.length > 0 ? (
            user.projects.map((proj: any, index: number) => (
              <View key={proj.id} style={[styles.itemRow, index !== user.projects!.length - 1 && styles.borderBottom]}>
                <View style={styles.itemIconWrap}><Folder size={20} color="#6366F1" /></View>
                <View style={styles.itemContent}>
                  <Text style={styles.itemTitle}>{proj.name}</Text>
                  {proj.description ? (
                    <TouchableOpacity onPress={() => Alert.alert(proj.name, proj.description)}>
                      <Text style={[styles.itemSubtitle, { textDecorationLine: 'underline' }]} numberOfLines={2}>{proj.description}</Text>
                    </TouchableOpacity>
                  ) : null}
                  {proj.technologies && proj.technologies.length > 0 ? (
                    <View style={styles.tagsContainer}>
                      {proj.technologies.map((tech: string, i: number) => (
                        <View key={i} style={[styles.tag, { paddingVertical: 2, paddingHorizontal: 6, backgroundColor: '#EFF6FF' }]}><Text style={[styles.tagText, { fontSize: 11, color: '#1E40AF' }]}>{tech}</Text></View>
                      ))}
                    </View>
                  ) : null}
                  {proj.url ? <Text style={[styles.itemDate, { color: '#4F46E5', marginTop: 4 }]} onPress={() => Linking.openURL(proj.url)}>Proje Linki</Text> : null}
                </View>
                <View style={styles.itemActions}>
                  <TouchableOpacity onPress={() => { setEditId(proj.id); setProjForm({ name: proj.name, description: proj.description || '', url: proj.url || '', technologies: proj.technologies?.join(', ') || '', startDate: proj.startDate?.substring(0, 10) || '', endDate: proj.endDate?.substring(0, 10) || '', isContinuing: proj.isContinuing || false }); setEditModal('project'); }}>
                    <Edit2 size={16} color="#64748B" style={{ marginRight: 12 }} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete('project', proj.id)}>
                    <Trash2 size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Proje eklenmemiş.</Text>
          )}
        </View>

        {/* 5. Sertifikalar Section */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Sertifikalar</Text>
            <TouchableOpacity onPress={() => { setEditId(null); setCertForm({ name: '', issuer: '', issueDate: '', expirationDate: '', credentialUrl: '' }); setEditModal('certification'); }}>
              <Plus size={20} color="#4F46E5" />
            </TouchableOpacity>
          </View>
          {user.certifications && user.certifications.length > 0 ? (
            user.certifications.map((cert: any, index: number) => (
              <View key={cert.id} style={[styles.itemRow, index !== user.certifications!.length - 1 && styles.borderBottom]}>
                <View style={styles.itemIconWrap}><Award size={20} color="#6366F1" /></View>
                <View style={styles.itemContent}>
                  <Text style={styles.itemTitle}>{cert.name}</Text>
                  {cert.issuer && <Text style={styles.itemSubtitle}>{cert.issuer}</Text>}
                  <Text style={styles.itemDate}>
                    {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString('tr-TR') : ''}
                  </Text>
                  {cert.credentialUrl ? <Text style={{ color: '#4F46E5', fontSize: 12, marginTop: 4 }} onPress={() => Linking.openURL(cert.credentialUrl)}>Doğrula</Text> : null}
                </View>
                <View style={styles.itemActions}>
                  <TouchableOpacity onPress={() => { setEditId(cert.id); setCertForm({ name: cert.name, issuer: cert.issuer || '', issueDate: cert.issueDate?.substring(0, 10) || '', expirationDate: cert.expirationDate?.substring(0, 10) || '', credentialUrl: cert.credentialUrl || '' }); setEditModal('certification'); }}>
                    <Edit2 size={16} color="#64748B" style={{ marginRight: 12 }} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete('certification', cert.id)}>
                    <Trash2 size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Sertifika eklenmemiş.</Text>
          )}
        </View>

        {/* 6. Yetenekler Section */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Yetenekler</Text>
            <TouchableOpacity onPress={() => { setSkillForm({ skillName: '' }); setEditModal('skill'); }}>
              <Plus size={20} color="#4F46E5" />
            </TouchableOpacity>
          </View>
          {user.userSkills && user.userSkills.length > 0 ? (
            <View style={styles.tagsContainer}>
              {user.userSkills.map((s: any) => (
                <View key={s.skillId || s.skill?.id} style={[styles.tag, { flexDirection: 'row', alignItems: 'center', gap: 6 }]}>
                  <Text style={styles.tagText}>{s.skill?.name || s.name}</Text>
                  <TouchableOpacity onPress={() => handleDelete('skill', s.skillId || s.skill?.id)}>
                    <Trash2 size={12} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>Yetenek eklenmemiş.</Text>
          )}
        </View>

        {/* 7. Diller Section */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Diller</Text>
            <TouchableOpacity onPress={() => { setEditId(null); setLangForm({ language: '', level: '' }); setEditModal('language'); }}>
              <Plus size={20} color="#4F46E5" />
            </TouchableOpacity>
          </View>
          {user.languages && user.languages.length > 0 ? (
            user.languages.map((lang: any, index: number) => (
              <View key={lang.id} style={[styles.itemRow, index !== user.languages!.length - 1 && styles.borderBottom]}>
                <View style={styles.itemIconWrap}><FileText size={20} color="#6366F1" /></View>
                <View style={styles.itemContent}>
                  <Text style={styles.itemTitle}>{lang.language}</Text>
                  <Text style={styles.itemSubtitle}>Seviye: {lang.level}</Text>
                </View>
                <View style={styles.itemActions}>
                  <TouchableOpacity onPress={() => { setEditId(lang.id); setLangForm({ language: lang.language, level: lang.level }); setEditModal('language'); }}>
                    <Edit2 size={16} color="#64748B" style={{ marginRight: 12 }} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete('language', lang.id)}>
                    <Trash2 size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Dil eklenmemiş.</Text>
          )}
        </View>

        {/* 8. Tercihler Section */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Tercihler</Text>
            <TouchableOpacity onPress={() => {
              setPrefForm({
                salaryMin: user.preferences?.salaryMin ? String(user.preferences.salaryMin) : '',
                currency: user.preferences?.currency || 'TRY',
                workModels: user.preferences?.workModels?.join(', ') || '',
                preferredCities: user.preferences?.preferredCities?.join(', ') || '',
                preferredWorkingHours: user.preferences?.preferredWorkingHours?.join(', ') || '',
                employmentTypes: user.preferences?.employmentTypes?.join(', ') || '',
              });
              setEditModal('preferences');
            }}>
              <Edit2 size={18} color="#4F46E5" />
            </TouchableOpacity>
          </View>
          {user.preferences ? (
            <View style={{ gap: 8 }}>
              {user.preferences.salaryMin ? (
                <Text style={styles.descText}>Beklenen Minimum Maaş: {user.preferences.salaryMin.toLocaleString('tr-TR')} {user.preferences.currency}</Text>
              ) : null}
              {user.preferences.workModels?.length > 0 ? (
                <Text style={styles.descText}>Çalışma Şekli: {user.preferences.workModels.join(', ')}</Text>
              ) : null}
              {user.preferences.preferredCities?.length > 0 ? (
                <Text style={styles.descText}>Tercih Edilen Şehirler: {user.preferences.preferredCities.join(', ')}</Text>
              ) : null}
              {user.preferences.employmentTypes?.length > 0 ? (
                <Text style={styles.descText}>İstihdam Türleri: {user.preferences.employmentTypes.join(', ')}</Text>
              ) : null}
            </View>
          ) : (
            <Text style={styles.emptyText}>Tercih bilgisi eklenmemiş.</Text>
          )}
        </View>

        {/* CV Upload */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Özgeçmiş (CV)</Text>
            {user.cvUrl && (
              <View style={styles.statusBadge}>
                <CheckCircle size={14} color="#059669" />
                <Text style={styles.statusText}>Yüklü</Text>
              </View>
            )}
          </View>
          <View style={styles.cvButtonsRow}>
            <TouchableOpacity style={styles.uploadButtonHalf} onPress={handleCvUpload} disabled={uploading}>
              {uploading ? (
                <ActivityIndicator color="#4F46E5" />
              ) : (
                <>
                  <Upload size={18} color="#4F46E5" />
                  <Text style={styles.uploadButtonText}>
                    {user.cvUrl ? 'Güncelle' : 'Yükle'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {user.cvUrl && (
              <>
                <TouchableOpacity style={styles.viewCvBtn} onPress={handleOpenCV}>
                  <ExternalLink size={18} color="#fff" />
                  <Text style={styles.viewCvBtnTxt}>CV İncele</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.viewCvBtn, { backgroundColor: '#FEE2E2', marginLeft: 8, paddingHorizontal: 12, flex: 0 }]} onPress={handleDeleteCV}>
                  <Trash2 size={18} color="#EF4444" />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuCard}>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/my-applications' as any)}>
            <View style={[styles.iconBg, { backgroundColor: '#F0FDF4' }]}><Briefcase size={20} color="#16A34A" /></View>
            <Text style={styles.menuItemText}>Başvurularım</Text>
            <ChevronRight size={20} color="#94A3B8" />
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/saved-jobs' as any)}>
            <View style={[styles.iconBg, { backgroundColor: '#FEF2F2' }]}><Folder size={20} color="#DC2626" /></View>
            <Text style={styles.menuItemText}>Favorilerim (Kaydedilenler)</Text>
            <ChevronRight size={20} color="#94A3B8" />
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/settings' as any)}>
            <View style={[styles.iconBg, { backgroundColor: '#F8FAFC' }]}><Settings size={20} color="#64748B" /></View>
            <Text style={styles.menuItemText}>Ayarlar & Gizlilik</Text>
            <ChevronRight size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>

      </View>

      {/* ========================================================== */}
      {/*                       MODALS                               */}
      {/* ========================================================== */}

      {/* ABOUT MODAL */}
      <Modal visible={editModal === 'about'} transparent animationType="slide" onRequestClose={() => setEditModal(null)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Hakkımda Düzenle</Text>
            <TextInput
              style={[styles.modalInput, { height: 120, textAlignVertical: 'top' }]}
              value={aboutText}
              onChangeText={setAboutText}
              multiline
              placeholder="Kendinden bahset..."
              placeholderTextColor={theme.muted}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setEditModal(null)}>
                <Text style={styles.modalCancelText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={handleSaveAbout}>
                <Text style={styles.modalSaveText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* EDUCATION MODAL */}
      <Modal visible={editModal === 'education'} transparent animationType="slide" onRequestClose={() => setEditModal(null)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{editId ? 'Eğitim Düzenle' : 'Eğitim Ekle'}</Text>
              
              <Text style={styles.modalLabel}>Okul Adı</Text>
              <TextInput style={styles.modalInput} value={eduForm.school} onChangeText={t => setEduForm({ ...eduForm, school: t })} placeholder="Örn: Boğaziçi Üniversitesi" placeholderTextColor={theme.muted} />

              <Text style={styles.modalLabel}>Derece</Text>
              <TextInput style={styles.modalInput} value={eduForm.degree} onChangeText={t => setEduForm({ ...eduForm, degree: t })} placeholder="Örn: Lisans" placeholderTextColor={theme.muted} />

              <Text style={styles.modalLabel}>Bölüm</Text>
              <TextInput style={styles.modalInput} value={eduForm.fieldOfStudy} onChangeText={t => setEduForm({ ...eduForm, fieldOfStudy: t })} placeholder="Örn: Bilgisayar Mühendisliği" placeholderTextColor={theme.muted} />

              <Text style={styles.modalLabel}>Başlangıç Tarihi (YYYY-AA-GG)</Text>
              <TextInput style={styles.modalInput} value={eduForm.startDate} onChangeText={t => setEduForm({ ...eduForm, startDate: t })} placeholder="Örn: 2018-09-15" placeholderTextColor={theme.muted} />

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 12 }}>
                <Text style={styles.modalLabel}>Devam Ediyor mu?</Text>
                <Switch value={eduForm.isContinuing} onValueChange={v => setEduForm({ ...eduForm, isContinuing: v })} />
              </View>

              {!eduForm.isContinuing && (
                <>
                  <Text style={styles.modalLabel}>Bitiş Tarihi (YYYY-AA-GG)</Text>
                  <TextInput style={styles.modalInput} value={eduForm.endDate} onChangeText={t => setEduForm({ ...eduForm, endDate: t })} placeholder="Örn: 2022-06-20" placeholderTextColor={theme.muted} />
                </>
              )}

              <Text style={styles.modalLabel}>Not Ortalaması (Grade)</Text>
              <TextInput style={styles.modalInput} value={eduForm.grade} onChangeText={t => setEduForm({ ...eduForm, grade: t })} placeholder="Örn: 3.50" placeholderTextColor={theme.muted} />

              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.modalCancel} onPress={() => setEditModal(null)}>
                  <Text style={styles.modalCancelText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalSave} onPress={handleSaveEducation}>
                  <Text style={styles.modalSaveText}>Kaydet</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* EXPERIENCE MODAL */}
      <Modal visible={editModal === 'experience'} transparent animationType="slide" onRequestClose={() => setEditModal(null)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{editId ? 'Deneyim Düzenle' : 'Deneyim Ekle'}</Text>
              
              <Text style={styles.modalLabel}>Şirket Adı</Text>
              <TextInput style={styles.modalInput} value={expForm.company} onChangeText={t => setExpForm({ ...expForm, company: t })} placeholder="Örn: KariyerRotası" placeholderTextColor={theme.muted} />

              <Text style={styles.modalLabel}>Unvan</Text>
              <TextInput style={styles.modalInput} value={expForm.title} onChangeText={t => setExpForm({ ...expForm, title: t })} placeholder="Örn: Senior Frontend Dev" placeholderTextColor={theme.muted} />

              <Text style={styles.modalLabel}>Lokasyon</Text>
              <TextInput style={styles.modalInput} value={expForm.location} onChangeText={t => setExpForm({ ...expForm, location: t })} placeholder="Örn: İstanbul / Hibrit" placeholderTextColor={theme.muted} />

              <Text style={styles.modalLabel}>Başlangıç Tarihi (YYYY-AA-GG)</Text>
              <TextInput style={styles.modalInput} value={expForm.startDate} onChangeText={t => setExpForm({ ...expForm, startDate: t })} placeholder="Örn: 2020-01-01" placeholderTextColor={theme.muted} />

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 12 }}>
                <Text style={styles.modalLabel}>Hala Çalışıyor musunuz?</Text>
                <Switch value={expForm.isContinuing} onValueChange={v => setExpForm({ ...expForm, isContinuing: v })} />
              </View>

              {!expForm.isContinuing && (
                <>
                  <Text style={styles.modalLabel}>Bitiş Tarihi (YYYY-AA-GG)</Text>
                  <TextInput style={styles.modalInput} value={expForm.endDate} onChangeText={t => setExpForm({ ...expForm, endDate: t })} placeholder="Örn: 2023-08-30" placeholderTextColor={theme.muted} />
                </>
              )}

              <Text style={styles.modalLabel}>Açıklama</Text>
              <TextInput style={[styles.modalInput, { height: 100, textAlignVertical: 'top' }]} value={expForm.description} onChangeText={t => setExpForm({ ...expForm, description: t })} multiline placeholder="Gereksinimler, sorumluluklar..." placeholderTextColor={theme.muted} />

              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.modalCancel} onPress={() => setEditModal(null)}>
                  <Text style={styles.modalCancelText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalSave} onPress={handleSaveExperience}>
                  <Text style={styles.modalSaveText}>Kaydet</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* PROJECT MODAL */}
      <Modal visible={editModal === 'project'} transparent animationType="slide" onRequestClose={() => setEditModal(null)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{editId ? 'Proje Düzenle' : 'Proje Ekle'}</Text>
              
              <Text style={styles.modalLabel}>Proje Adı</Text>
              <TextInput style={styles.modalInput} value={projForm.name} onChangeText={t => setProjForm({ ...projForm, name: t })} placeholder="Örn: Portfolyo Sitesi" placeholderTextColor={theme.muted} />

              <Text style={styles.modalLabel}>Açıklama</Text>
              <TextInput style={[styles.modalInput, { height: 80, textAlignVertical: 'top' }]} value={projForm.description} onChangeText={t => setProjForm({ ...projForm, description: t })} multiline placeholder="Proje ne işe yarıyor..." placeholderTextColor={theme.muted} />

              <Text style={styles.modalLabel}>URL / Link</Text>
              <TextInput style={styles.modalInput} value={projForm.url} onChangeText={t => setProjForm({ ...projForm, url: t })} placeholder="https://..." placeholderTextColor={theme.muted} autoCapitalize="none" />

              <Text style={styles.modalLabel}>Kullanılan Teknolojiler (virgülle ayırın)</Text>
              <TextInput style={styles.modalInput} value={projForm.technologies} onChangeText={t => setProjForm({ ...projForm, technologies: t })} placeholder="Örn: React, Node.js, Prisma" placeholderTextColor={theme.muted} />

              <Text style={styles.modalLabel}>Başlangıç Tarihi (YYYY-AA-GG)</Text>
              <TextInput style={styles.modalInput} value={projForm.startDate} onChangeText={t => setProjForm({ ...projForm, startDate: t })} placeholder="Örn: 2021-03-01" placeholderTextColor={theme.muted} />

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 12 }}>
                <Text style={styles.modalLabel}>Devam Ediyor mu?</Text>
                <Switch value={projForm.isContinuing} onValueChange={v => setProjForm({ ...projForm, isContinuing: v })} />
              </View>

              {!projForm.isContinuing && (
                <>
                  <Text style={styles.modalLabel}>Bitiş Tarihi (YYYY-AA-GG)</Text>
                  <TextInput style={styles.modalInput} value={projForm.endDate} onChangeText={t => setProjForm({ ...projForm, endDate: t })} placeholder="Örn: 2021-06-01" placeholderTextColor={theme.muted} />
                </>
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.modalCancel} onPress={() => setEditModal(null)}>
                  <Text style={styles.modalCancelText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalSave} onPress={handleSaveProject}>
                  <Text style={styles.modalSaveText}>Kaydet</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* CERTIFICATION MODAL */}
      <Modal visible={editModal === 'certification'} transparent animationType="slide" onRequestClose={() => setEditModal(null)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{editId ? 'Sertifika Düzenle' : 'Sertifika Ekle'}</Text>
              
              <Text style={styles.modalLabel}>Sertifika Adı</Text>
              <TextInput style={styles.modalInput} value={certForm.name} onChangeText={t => setCertForm({ ...certForm, name: t })} placeholder="Örn: AWS Certified Developer" placeholderTextColor={theme.muted} />

              <Text style={styles.modalLabel}>Veren Kuruluş</Text>
              <TextInput style={styles.modalInput} value={certForm.issuer} onChangeText={t => setCertForm({ ...certForm, issuer: t })} placeholder="Örn: Amazon Web Services" placeholderTextColor={theme.muted} />

              <Text style={styles.modalLabel}>Veriliş Tarihi (YYYY-AA-GG)</Text>
              <TextInput style={styles.modalInput} value={certForm.issueDate} onChangeText={t => setCertForm({ ...certForm, issueDate: t })} placeholder="Örn: 2023-05-10" placeholderTextColor={theme.muted} />

              <Text style={styles.modalLabel}>Son Geçerlilik (YYYY-AA-GG, opsiyonel)</Text>
              <TextInput style={styles.modalInput} value={certForm.expirationDate} onChangeText={t => setCertForm({ ...certForm, expirationDate: t })} placeholder="Örn: 2026-05-10" placeholderTextColor={theme.muted} />

              <Text style={styles.modalLabel}>Sertifika URL / Sorgulama Linki</Text>
              <TextInput style={styles.modalInput} value={certForm.credentialUrl} onChangeText={t => setCertForm({ ...certForm, credentialUrl: t })} placeholder="https://..." placeholderTextColor={theme.muted} autoCapitalize="none" />

              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.modalCancel} onPress={() => setEditModal(null)}>
                  <Text style={styles.modalCancelText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalSave} onPress={handleSaveCertification}>
                  <Text style={styles.modalSaveText}>Kaydet</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* LANGUAGE MODAL */}
      <Modal visible={editModal === 'language'} transparent animationType="slide" onRequestClose={() => setEditModal(null)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editId ? 'Dil Düzenle' : 'Dil Ekle'}</Text>
            
            <Text style={styles.modalLabel}>Dil Adı</Text>
            <TextInput style={styles.modalInput} value={langForm.language} onChangeText={t => setLangForm({ ...langForm, language: t })} placeholder="Örn: İngilizce" placeholderTextColor={theme.muted} />

            <Text style={styles.modalLabel}>Seviye</Text>
            <TextInput style={styles.modalInput} value={langForm.level} onChangeText={t => setLangForm({ ...langForm, level: t })} placeholder="Örn: İleri (C1)" placeholderTextColor={theme.muted} />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setEditModal(null)}>
                <Text style={styles.modalCancelText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={handleSaveLanguage}>
                <Text style={styles.modalSaveText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* SKILL MODAL */}
      <Modal visible={editModal === 'skill'} transparent animationType="slide" onRequestClose={() => setEditModal(null)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Yetenek Ekle</Text>
            
            <Text style={styles.modalLabel}>Yetenek Adı</Text>
            <TextInput style={styles.modalInput} value={skillForm.skillName} onChangeText={t => setSkillForm({ skillName: t })} placeholder="Örn: React Native" placeholderTextColor={theme.muted} />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setEditModal(null)}>
                <Text style={styles.modalCancelText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={handleSaveSkill}>
                <Text style={styles.modalSaveText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* PREFERENCES MODAL */}
      <Modal visible={editModal === 'preferences'} transparent animationType="slide" onRequestClose={() => setEditModal(null)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Tercihlerini Düzenle</Text>
              
              <Text style={styles.modalLabel}>Minimum Maaş Beklentisi</Text>
              <TextInput style={styles.modalInput} value={prefForm.salaryMin} onChangeText={t => setPrefForm({ ...prefForm, salaryMin: t })} placeholder="Örn: 50000" keyboardType="numeric" placeholderTextColor={theme.muted} />

              <Text style={styles.modalLabel}>Para Birimi</Text>
              <TextInput style={styles.modalInput} value={prefForm.currency} onChangeText={t => setPrefForm({ ...prefForm, currency: t })} placeholder="TRY, USD, EUR..." placeholderTextColor={theme.muted} />

              <Text style={styles.modalLabel}>Çalışma Şekilleri (virgülle ayırın)</Text>
              <TextInput style={styles.modalInput} value={prefForm.workModels} onChangeText={t => setPrefForm({ ...prefForm, workModels: t })} placeholder="Örn: remote, hybrid" placeholderTextColor={theme.muted} />

              <Text style={styles.modalLabel}>Tercih Edilen Şehirler (virgülle ayırın)</Text>
              <TextInput style={styles.modalInput} value={prefForm.preferredCities} onChangeText={t => setPrefForm({ ...prefForm, preferredCities: t })} placeholder="Örn: İstanbul, Ankara" placeholderTextColor={theme.muted} />

              <Text style={styles.modalLabel}>İstihdam Türleri (virgülle ayırın)</Text>
              <TextInput style={styles.modalInput} value={prefForm.employmentTypes} onChangeText={t => setPrefForm({ ...prefForm, employmentTypes: t })} placeholder="Örn: Tam Zamanlı, Proje Bazlı" placeholderTextColor={theme.muted} />

              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.modalCancel} onPress={() => setEditModal(null)}>
                  <Text style={styles.modalCancelText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalSave} onPress={handleSavePref}>
                  <Text style={styles.modalSaveText}>Kaydet</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingTop: 60,
    paddingBottom: 24,
    alignItems: 'center',
    shadowColor: '#312E81',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
    overflow: 'hidden',
  },
  headerBackground: {
    position: 'absolute',
    top: 0, left: 0, right: 0, height: 120,
    backgroundColor: '#312E81',
  },
  profileSection: { alignItems: 'center', marginTop: 10, width: '100%' },
  avatarContainer: { position: 'relative', marginBottom: 12 },
  avatar: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 4, borderColor: '#fff',
    backgroundColor: '#EEF2FF',
  },
  avatarPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 36, fontWeight: '900', color: '#4F46E5' },
  editAvatarBadge: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: '#4F46E5', width: 32, height: 32,
    borderRadius: 16, justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#fff',
  },
  name: { fontSize: 24, fontWeight: '900', color: '#0F172A', marginBottom: 4 },
  title: { fontSize: 15, fontWeight: '600', color: '#64748B', marginBottom: 16 },
  scoreContainer: { width: '80%', alignItems: 'center', marginBottom: 16 },
  scoreText: { fontSize: 12, fontWeight: '700', color: '#4F46E5', marginBottom: 6 },
  scoreBarBg: { width: '100%', height: 6, backgroundColor: '#EEF2FF', borderRadius: 3 },
  scoreBarFill: { height: '100%', backgroundColor: '#4F46E5', borderRadius: 3 },
  
  editProfileBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#EEF2FF', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999 },
  editProfileTxt: { color: '#4F46E5', fontSize: 14, fontWeight: '700' },

  content: { padding: 16, gap: 16 },
  card: {
    backgroundColor: '#fff', borderRadius: 24, padding: 20,
    shadowColor: '#312E81', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03, shadowRadius: 10, elevation: 2,
  },
  cardTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 16 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '700', color: '#059669' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  iconBg: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' },
  infoText: { fontSize: 15, fontWeight: '500', color: '#475569', flex: 1 },
  
  descText: { fontSize: 15, color: '#475569', lineHeight: 24 },
  emptyText: { fontSize: 14, color: '#94A3B8', fontStyle: 'italic' },

  itemRow: { flexDirection: 'row', gap: 16, paddingVertical: 12, alignItems: 'flex-start' },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  itemIconWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  itemContent: { flex: 1, justifyContent: 'center' },
  itemTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 2 },
  itemSubtitle: { fontSize: 14, color: '#475569', marginBottom: 4 },
  itemDate: { fontSize: 12, color: '#94A3B8', fontWeight: '500' },
  itemActions: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingTop: 4 },

  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  tagText: { color: '#475569', fontSize: 13, fontWeight: '600' },

  cvButtonsRow: { flexDirection: 'row', gap: 12 },
  uploadButtonHalf: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#EEF2FF', paddingVertical: 14, borderRadius: 16, borderWidth: 1, borderColor: '#C7D2FE', borderStyle: 'dashed',
  },
  uploadButtonText: { fontSize: 15, fontWeight: '700', color: '#4F46E5' },
  viewCvBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#4F46E5', borderRadius: 16 },
  viewCvBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
  
  menuCard: {
    backgroundColor: '#fff', borderRadius: 24, padding: 8,
    shadowColor: '#312E81', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03, shadowRadius: 10, elevation: 2,
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  menuItemText: { fontSize: 16, fontWeight: '600', color: '#0F172A', flex: 1 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginHorizontal: 12 },
  
  logoutButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#FEF2F2', padding: 16, borderRadius: 16,
  },
  logoutText: { fontSize: 16, fontWeight: '700', color: '#EF4444' },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalScroll: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 12,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalCancel: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 15,
  },
  modalSave: {
    flex: 1,
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  modalSaveText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
