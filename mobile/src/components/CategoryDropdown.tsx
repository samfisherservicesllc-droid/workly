import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';
import { ChevronDown, X, Search, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { SERVICE_CATEGORIES, CATEGORY_GROUPS } from '@/lib/categories';
import { ServiceCategory } from '@/lib/types';

interface CategoryDropdownProps {
  value: string | null;
  onChange: (categoryId: string | null) => void;
  placeholder?: string;
  label?: string;
  allowClear?: boolean;
  multiSelect?: boolean;
  selectedValues?: string[];
  onMultiChange?: (categoryIds: string[]) => void;
}

export function CategoryDropdown({
  value,
  onChange,
  placeholder = 'Select a category',
  label,
  allowClear = false,
  multiSelect = false,
  selectedValues = [],
  onMultiChange,
}: CategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedCategory = SERVICE_CATEGORIES.find((c) => c.id === value);
  const displayText = selectedCategory?.name ?? placeholder;

  const filteredCategories = searchQuery
    ? SERVICE_CATEGORIES.filter((cat) =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : SERVICE_CATEGORIES;

  const handleSelect = (categoryId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (multiSelect && onMultiChange) {
      const isSelected = selectedValues.includes(categoryId);
      if (isSelected) {
        onMultiChange(selectedValues.filter((id) => id !== categoryId));
      } else {
        onMultiChange([...selectedValues, categoryId]);
      }
    } else {
      onChange(value === categoryId ? null : categoryId);
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (multiSelect && onMultiChange) {
      onMultiChange([]);
    } else {
      onChange(null);
    }
    setIsOpen(false);
  };

  const renderCategoryItem = (category: ServiceCategory) => {
    const isSelected = multiSelect
      ? selectedValues.includes(category.id)
      : value === category.id;

    return (
      <Pressable
        key={category.id}
        onPress={() => handleSelect(category.id)}
        className={`flex-row items-center justify-between px-4 py-3 border-b border-workly-border/50 ${
          isSelected ? 'bg-workly-teal/10' : ''
        }`}
      >
        <View className="flex-1">
          <Text
            className={`text-base ${
              isSelected ? 'text-workly-teal font-medium' : 'text-white'
            }`}
          >
            {category.name}
          </Text>
          {category.description && (
            <Text className="text-slate-500 text-xs mt-0.5" numberOfLines={1}>
              {category.description}
            </Text>
          )}
        </View>
        {isSelected && <Check color="#2979FF" size={20} />}
      </Pressable>
    );
  };

  return (
    <View>
      {label && (
        <Text className="text-white font-semibold mb-2">{label}</Text>
      )}

      {/* Dropdown Trigger */}
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setIsOpen(true);
        }}
        className="flex-row items-center justify-between bg-workly-bg-card rounded-xl px-4 py-3.5 border border-workly-border"
      >
        <Text
          className={`text-base ${
            selectedCategory || (multiSelect && selectedValues.length > 0)
              ? 'text-white'
              : 'text-slate-500'
          }`}
        >
          {multiSelect && selectedValues.length > 0
            ? `${selectedValues.length} selected`
            : displayText}
        </Text>
        <ChevronDown color="#6B7280" size={20} />
      </Pressable>

      {/* Selected categories chips for multi-select */}
      {multiSelect && selectedValues.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-2"
          style={{ flexGrow: 0 }}
        >
          {selectedValues.map((catId) => {
            const cat = SERVICE_CATEGORIES.find((c) => c.id === catId);
            if (!cat) return null;
            return (
              <Pressable
                key={catId}
                onPress={() => handleSelect(catId)}
                className="flex-row items-center bg-workly-teal/20 px-3 py-1.5 rounded-full mr-2"
              >
                <Text className="text-workly-teal text-sm">{cat.name}</Text>
                <X color="#2979FF" size={14} className="ml-1" />
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {/* Modal Dropdown */}
      <Modal
        visible={isOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsOpen(false)}
      >
        <View className="flex-1 bg-black/60">
          <Pressable
            className="flex-1"
            onPress={() => setIsOpen(false)}
          />
          <View className="bg-workly-bg-dark rounded-t-3xl max-h-[70%]">
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-4 border-b border-workly-border">
              <Text className="text-white text-lg font-semibold">
                {multiSelect ? 'Select Categories' : 'Select Category'}
              </Text>
              <View className="flex-row items-center">
                {allowClear && (value || selectedValues.length > 0) && (
                  <Pressable onPress={handleClear} className="mr-4">
                    <Text className="text-workly-teal text-sm">Clear</Text>
                  </Pressable>
                )}
                <Pressable
                  onPress={() => setIsOpen(false)}
                  className="w-8 h-8 bg-workly-bg-card rounded-full items-center justify-center"
                >
                  <X color="#6B7280" size={18} />
                </Pressable>
              </View>
            </View>

            {/* Search */}
            <View className="px-4 py-3">
              <View className="flex-row items-center bg-workly-bg-card rounded-xl px-3 py-2.5 border border-workly-border">
                <Search color="#6B7280" size={18} />
                <TextInput
                  className="flex-1 ml-2 text-white text-base"
                  placeholder="Search categories..."
                  placeholderTextColor="#6B7280"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCapitalize="none"
                />
                {searchQuery.length > 0 && (
                  <Pressable onPress={() => setSearchQuery('')}>
                    <X color="#6B7280" size={16} />
                  </Pressable>
                )}
              </View>
            </View>

            {/* Categories List */}
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              {searchQuery ? (
                // Flat list when searching
                filteredCategories.map(renderCategoryItem)
              ) : (
                // Grouped list when not searching
                CATEGORY_GROUPS.map((group) => {
                  const groupCategories = SERVICE_CATEGORIES.filter((cat) =>
                    group.ids.includes(cat.id)
                  );
                  if (groupCategories.length === 0) return null;

                  return (
                    <View key={group.title}>
                      <View className="px-4 py-2 bg-workly-bg-input/50">
                        <Text className="text-slate-400 text-xs font-medium uppercase tracking-wide">
                          {group.title}
                        </Text>
                      </View>
                      {groupCategories.map(renderCategoryItem)}
                    </View>
                  );
                })
              )}

              {filteredCategories.length === 0 && (
                <View className="items-center py-8">
                  <Text className="text-slate-400">No categories found</Text>
                </View>
              )}

              {/* Bottom padding */}
              <View className="h-8" />
            </ScrollView>

            {/* Done button for multi-select */}
            {multiSelect && (
              <View className="px-4 py-4 border-t border-workly-border">
                <Pressable
                  onPress={() => setIsOpen(false)}
                  className="bg-workly-teal py-3 rounded-xl"
                >
                  <Text className="text-white text-center font-semibold">
                    Done ({selectedValues.length} selected)
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
