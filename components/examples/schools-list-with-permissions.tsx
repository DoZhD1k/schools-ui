import { useDataFilter } from "@/hooks/usePermissions";
import { usePermissions } from "@/hooks/usePermissions";

/**
 * Пример компонента для демонстрации фильтрации данных по ролям
 *
 * Использование:
 * - Администратор: видит все школы
 * - Управление образования: видит все школы
 * - Организация образования: видит только свою школу
 */

interface School {
  id: number;
  name: string;
  address: string;
  school_id?: number;
}

interface SchoolsListProps {
  schools: School[];
}

export function SchoolsList({ schools }: SchoolsListProps) {
  const permissions = usePermissions();
  const { filterSchoolData } = useDataFilter();

  // Фильтруем школы согласно правам доступа пользователя
  const accessibleSchools = filterSchoolData(schools);

  if (!permissions) {
    return <div>Необходимо войти в систему</div>;
  }

  const getRoleInfo = () => {
    const roleDescription = permissions.getRoleDescription();
    const dataScope = permissions.getDataScope();

    let scopeText = "";
    switch (dataScope) {
      case "admin_full":
        scopeText = "Все школы (админ)";
        break;
      case "all_schools":
        scopeText = "Все школы в регионе";
        break;
      case "own_school":
        scopeText = "Только своя школа";
        break;
      default:
        scopeText = "Нет доступа";
    }

    return { roleDescription, scopeText };
  };

  const { roleDescription, scopeText } = getRoleInfo();

  return (
    <div className="space-y-4">
      {/* Информация о текущих правах доступа */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900">
          Права доступа: {roleDescription}
        </h3>
        <p className="text-xs text-blue-700">Область доступа: {scopeText}</p>
        <p className="text-xs text-blue-600">
          Доступно школ: {accessibleSchools.length} из {schools.length}
        </p>
      </div>

      {/* Список школ */}
      <div className="grid gap-3">
        {accessibleSchools.length > 0 ? (
          accessibleSchools.map((school) => (
            <div
              key={school.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
            >
              <h4 className="font-medium text-gray-900">{school.name}</h4>
              <p className="text-sm text-gray-600">{school.address}</p>
              <div className="mt-2 flex gap-2">
                {permissions.canInputData() && (
                  <button className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                    Изменить данные
                  </button>
                )}
                {permissions.canViewReports() && (
                  <button className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                    Просмотр отчетов
                  </button>
                )}
                {permissions.canViewAnalytics() && (
                  <button className="text-xs bg-purple-500 text-white px-2 py-1 rounded">
                    Аналитика
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>Нет доступных школ для вашей роли</p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Хук для получения списка школ с учетом прав доступа
 */
export function useAccessibleSchools() {
  const permissions = usePermissions();
  const { getAccessibleSchoolIds } = useDataFilter();

  // Функция для фильтрации школ по ID
  const filterSchoolsByIds = (schools: School[], availableIds?: number[]) => {
    if (!permissions || !availableIds) return [];

    // Если все школы доступны
    if (permissions.canManageAllSchools()) {
      return schools;
    }

    // Фильтруем по доступным ID
    return schools.filter((school) =>
      availableIds.includes(school.school_id || school.id)
    );
  };

  return {
    filterSchoolsByIds,
    getAccessibleSchoolIds,
    permissions,
  };
}
