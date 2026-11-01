import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Platform,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import {
  CreditCard,
  Building2,
  FileText,
  Globe,
  ArrowUpRight,
} from 'lucide-react-native';
import {
  BorderRadius,
  FontSizes,
  Fonts,
  Spacing,
  ThemeColors,
} from '../constants/theme';

export interface QuickLinksProps {
  colors: ThemeColors;
}

interface QuickLinkItem {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: React.ElementType;
}

export const QuickLinks: React.FC<QuickLinksProps> = ({ colors }) => {
  const links: QuickLinkItem[] = [
    {
      id: 'payments',
      title: 'Payments',
      description: 'Tuition & fees',
      url: 'https://usosapps.vistula.edu.pl/kontroler.php?_action=actionx:dla_stud/platnosci/index()',
      icon: CreditCard,
    },
    {
      id: 'dormitory',
      title: 'Dormitory',
      description: 'Housing & rooms',
      url: 'https://usosapps.vistula.edu.pl/kontroler.php?_action=actionx:dla_stud/akademiki/index()',
      icon: Building2,
    },
    {
      id: 'requests',
      title: 'Applications',
      description: 'Forms & requests',
      url: 'https://usosapps.vistula.edu.pl/kontroler.php?_action=actionx:dla_stud/podania/index()',
      icon: FileText,
    },
    {
      id: 'usosweb',
      title: 'USOSweb',
      description: 'Desktop portal',
      url: 'https://usosapps.vistula.edu.pl/',
      icon: Globe,
    },
  ];

  const handlePress = async (url: string) => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.open(url, '_blank', 'noopener,noreferrer');
        return;
      }
      await WebBrowser.openBrowserAsync(url, {
        toolbarColor: colors.background,
        controlsColor: colors.primary,
      });
    } catch {
      Linking.openURL(url).catch((err) => {
        console.warn('[QuickLinks] Failed to open URL:', url, err);
      });
    }
  };

  return (
    <View style={styles.grid}>
      {links.map((item) => {
        const IconComponent = item.icon;

        return (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={() => handlePress(item.url)}
            activeOpacity={0.7}
            accessibilityRole="link"
            accessibilityLabel={`${item.title}, opens external link`}
          >
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: colors.surfaceHighlight },
                ]}
              >
                <IconComponent size={18} color={colors.textSecondary} strokeWidth={1.8} />
              </View>
              <ArrowUpRight size={14} color={colors.textTertiary} strokeWidth={1.8} />
            </View>

            <Text
              style={[styles.title, { color: colors.text }]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text
              style={[styles.description, { color: colors.textTertiary }]}
              numberOfLines={1}
            >
              {item.description}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm + 2,
  },
  card: {
    width: '48%',
    flexGrow: 1,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.sm,
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  description: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.xs,
    letterSpacing: 0.1,
  },
});

export default QuickLinks;
