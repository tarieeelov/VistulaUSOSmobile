import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import {
  CreditCard,
  Building2,
  FileText,
  Globe,
  ExternalLink,
} from 'lucide-react-native';
import {
  BorderRadius,
  FontSizes,
  Fonts,
  Shadows,
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
  accentColor: string;
}

export const QuickLinks: React.FC<QuickLinksProps> = ({ colors }) => {
  const links: QuickLinkItem[] = [
    {
      id: 'payments',
      title: 'Payments',
      description: 'Tuition & fees',
      url: 'https://usosapps.vistula.edu.pl/kontroler.php?_action=actionx:dla_stud/platnosci/index()',
      icon: CreditCard,
      accentColor: colors.primary,
    },
    {
      id: 'dormitory',
      title: 'Dormitory',
      description: 'Housing & rooms',
      url: 'https://usosapps.vistula.edu.pl/kontroler.php?_action=actionx:dla_stud/akademiki/index()',
      icon: Building2,
      accentColor: colors.accent,
    },
    {
      id: 'requests',
      title: 'Requests',
      description: 'Applications & forms',
      url: 'https://usosapps.vistula.edu.pl/kontroler.php?_action=actionx:dla_stud/podania/index()',
      icon: FileText,
      accentColor: colors.warning,
    },
    {
      id: 'usosweb',
      title: 'USOSweb',
      description: 'Main portal',
      url: 'https://usosapps.vistula.edu.pl/',
      icon: Globe,
      accentColor: colors.success,
    },
  ];

  const handlePress = async (url: string) => {
    try {
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
                borderColor: colors.borderLight,
              },
            ]}
            onPress={() => handlePress(item.url)}
            activeOpacity={0.7}
            accessibilityRole="link"
            accessibilityLabel={`${item.title}, opens external browser`}
          >
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: `${item.accentColor}1A` },
                ]}
              >
                <IconComponent size={22} color={item.accentColor} />
              </View>
              <ExternalLink size={14} color={colors.textTertiary} />
            </View>

            <Text
              style={[styles.title, { color: colors.text }]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text
              style={[styles.description, { color: colors.textSecondary }]}
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
    gap: Spacing.md,
  },
  card: {
    width: '47.5%',
    flexGrow: 1,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.base,
    ...Shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.base,
    marginBottom: 2,
  },
  description: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.xs,
  },
});
