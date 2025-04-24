import { useState, useEffect, Fragment } from "react";
import React from "react";
import axios from "axios";
import {
  Input,
  Option,
  Select,
  Button,
  Dialog,
  Textarea,
  IconButton,
  Typography,
  DialogBody,
  DialogHeader,
  DialogFooter,
  ThemeProvider,
  Spinner,حذف
}from "@material-tailwind/react";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const ProfessorCoursesManager = ({ professorId }) => {
  const [selectedCourse, setSelectedCourse] = useState("");
  const queryClient = useQueryClient();

  // جلب جميع المواد
  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const token = localStorage.getItem("userToken");
      const { data } = await axios.get("http://timetableapi.runasp.net/api/Courses", {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data;
    }
  });

  // جلب المواد المربوطة
  const { data: assignedCourses = [], isLoading: assignedLoading } = useQuery({
    queryKey: ['assignedCourses', professorId],
    queryFn: async () => {
      const token = localStorage.getItem("userToken");
      const { data } = await axios.get(
        `http://timetableapi.runasp.net/api/CourseProfessors/${professorId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data;
    },
    enabled: !!professorId
  });

  // إضافة مادة
  const assignMutation = useMutation({
    mutationFn: (courseId) => axios.post(
      `http://timetableapi.runasp.net/api/CourseProfessors/${professorId}/${courseId}`,
      {},
      { headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` } }
    ),
    onSuccess: () => {
      queryClient.invalidateQueries(['assignedCourses', professorId]);
      setSelectedCourse("");
    }
  });

  // حذف مادة
  const unassignMutation = useMutation({
    mutationFn: (courseId) => axios.delete(
      `http://timetableapi.runasp.net/api/CourseProfessors/${professorId}/${courseId}`,
      { headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` } }
    ),
    onSuccess: () => queryClient.invalidateQueries(['assignedCourses', professorId])
  });
  
  return (
    <div className="p-4 mt-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-3">ربط المواد الدراسية</h3>
      
      <div className="flex gap-2 mb-4">
        <Select 
          value={selectedCourse} 
          onChange={(value) => setSelectedCourse(value)}
          label="اختر مادة"
          className="flex-1"
        >
          {courses.map(course => (
            <Option key={course.id} value={course.id}>
              {course.name}
            </Option>
          ))}
        </Select>
        
        <Button 
          onClick={() => assignMutation.mutate(selectedCourse)}
          disabled={!selectedCourse || assignMutation.isLoading}
        >
          {assignMutation.isLoading ? <Spinner className="h-4 w-4" /> : "إضافة"}
        </Button>
      </div>

      <div className="space-y-2">
        {assignedLoading ? (
          <Spinner className="h-8 w-8 mx-auto" />
        ) : assignedCourses.map(course => (
          <div key={course.id} className="flex justify-between items-center p-2 bg-white rounded">
            <span>{course.name}</span>
            <Button 
              variant="text" 
              color="red"
              onClick={() => unassignMutation.mutate(course.id)}
              disabled={unassignMutation.isLoading}
            >
              {unassignMutation.isLoading ? <Spinner className="h-4 w-4" /> : "حذف"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};



const GetProfessors = () => {
  const [editProfessor, setEditProfessor] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const queryClient = useQueryClient();
  const [selectedProfessor, setSelectedProfessor] = useState(null);
  const [message, setMessage] = useState("");

  
  const [professor, setProfessor] = useState({
    id: "",
    name: "",
    availability: [] 
  });
  const dayMap = {
    Saturday: "sat",
    Sunday: "sun",
    Monday: "mon",
    Tuesday: "tue",
    Wednesday: "wed",
    Thursday: "thu",
    Friday: "fri"
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "id" && !/^\d*$/.test(value)) return;
    setProfessor(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setProfessor(prev => ({
      ...prev,
      availability: checked
        ? [...prev.availability, name]
        : prev.availability.filter(day => day !== name)
    }));
  };
  const mutation = useMutation({
    mutationFn: async (payload) => {
      const token = localStorage.getItem("userToken");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      };
      
      const url = isEdit 
        ? `http://timetableapi.runasp.net/api/Professors/${payload.id}`
        : "http://timetableapi.runasp.net/api/Professors";
      
      const method = isEdit ? axios.put : axios.post;
      const { data } = await method(url, payload, { headers });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['professors']);
      setMessage("✅ تم الحفظ بنجاح");
      handleOpen();
      resetForm();
    },
    onError: (error) => {
      setMessage(`❌ خطأ: ${error.response?.data?.message || error.message}`);
    }
  });
  

  
  const [filteredProfessors, setFilteredProfessors] = useState([]);
  const [search, setSearch] = useState("");
  
  const [open, setOpen] = React.useState(false);


  const { 
    data: professors = [], 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['professors'],
    queryFn: async () => {
      const token = localStorage.getItem("userToken");
      const { data } = await axios.get(
        "http://timetableapi.runasp.net/api/Professors",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      return data;
    }
  });

  useEffect(() => {
    const filtered = professors.filter((prof) =>
      prof.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredProfessors(filtered);
  }, [search, professors]);

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const token = localStorage.getItem("userToken");
      await axios.delete(
        `http://timetableapi.runasp.net/api/Professors/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['professors']);
      setMessage("✅ تم الحذف بنجاح");
    },
    onError: (error) => {
      setMessage(`❌ خطأ في الحذف: ${error.response?.data?.message}`);
    }
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const daysObject = Object.keys(dayMap).reduce((acc, day) => {
      acc[dayMap[day]] = professor.availability.includes(day);
      return acc;
    }, {});
    const payload = {
      id: parseInt(professor.id, 10),
      name: professor.name.trim(),
      numberAssignedCourses: 1,
      ...daysObject
    };
    
    mutation.mutate(payload);
  };
  const handleDelete = (id) => {
    if (window.confirm("Are You Sure About Delete")) {
      deleteMutation.mutate(id);
    }
  };
  const resetForm = () => {
    setProfessor({ id: "", name: "", availability: [] });
    setIsEdit(false);
    setEditProfessor(null);
  };
  const handleOpen = (professorToEdit = null) => {
    if (professorToEdit) {
      setProfessor({
        id: professorToEdit.id.toString(),
        name: professorToEdit.name,
        availability: Object.keys(dayMap).filter(day => professorToEdit[dayMap[day]])
      });
      setIsEdit(true);
      setEditProfessor(professorToEdit);
    } else {
      resetForm();
      setSelectedProfessor(null);
    }
    setOpen(!open);
  };
 

  return <>
    
   
   <div className="background-main-pages p-11">
    <div className="max-w-screen-xl mx-auto rounded-md bg-slate-800 px-4 sm:px-6 ">
    {message && (
          <div className={`p-3 mb-4 rounded-lg ${
            message.startsWith("✅") 
              ? "bg-green-100 text-green-700" 
              : "bg-red-100 text-red-700"
          }`}>
            {message}
          </div>
        )}
    <div className="flex justify-end  ">
  <Button onClick={() => handleOpen()} variant="gradient" className="bg-blue-700">
  {isEdit ?"Modify Proffesors": "Add Proffesor"}
  </Button>
</div>
      <Dialog size="lg" open={open} handler={handleOpen} className="p-4 w-3/4 mx-auto mt-20 max-h-[80vh] overflow-y-auto rounded-xl shadow-lg bg-white  ">
        <DialogHeader className="relative m-0 block">
          <Typography variant="h3" color="blue-gray">
            Enter Professors
          </Typography>
          
          <IconButton
            size="sm"
            variant="text"
            className="!absolute right-3.5 top-3.5"
            onClick={handleOpen}
          >
            <XMarkIcon className="h-4 w-4 stroke-2" />
          </IconButton>
        </DialogHeader>
        <DialogBody className="space-y-4 pb-6">
          <div>
            <Typography
              variant="small"
              color="blue-gray"
              className="mb-2 text-left font-medium"
            >
              Name Professor
            </Typography>
            <Input
              color="gray"
              size="lg"
              placeholder="eg. White Shoes"
              name="name"
              value={professor.name}
              onChange={handleChange}
              className="placeholder:opacity-100 focus:!border-t-gray-900"
              containerProps={{
                className: "!min-w-full",
              }}
              labelProps={{
                className: "hidden",
              }}
            />
          </div>
          
          
          <div>
          <label className="block font-semibold">📆 الأيام المتاح فيها الدكتور:</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(dayMap).map((day) => (
              <label key={day} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name={day}
                  checked={professor.availability.includes(day)}
                  onChange={handleCheckboxChange}
                />
                <span>{day}</span>
              </label>
            ))}
          </div>
        </div>
          
          
        </DialogBody>
        <DialogFooter>
        <Button
  className="ml-auto text-black"
  onClick={handleSubmit}
  disabled={mutation.isPending}
>  {mutation.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
        
</Button>
        </DialogFooter>
      </Dialog>
    <Fragment>
      <div className="text-center">
      <input
        type="text"
        placeholder="🔍 ابحث عن أستاذ بالاسم..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className=" mt-5  w-3/5 p-2 border rounded mb-4"
      /></div>
      <div className="flex flex-col ">
        <div className="-m-1.5 overflow-x-auto">
          <div className="p-1.5 min-w-full inline-block align-middle">
            <div className="overflow-hidden ">
              <table className="min-w-full divide-y  divide-gray-200 dark:divide-neutral-700">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-start text-xs font-medium  text-white uppercase dark:text-neutral-500"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-start text-xs font-medium text-white uppercase dark:text-neutral-500"
                    >
                      Available Days
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-start text-xs font-medium text-white uppercase dark:text-neutral-500"
                    >
                      Assigned Courses
                    </th>
                    <th
                      scope="col" 
                      className="px-6 py-3 text-end text-xs font-medium text-white uppercase dark:text-neutral-500"
                    >
                      Action
                    </th>
                    <th
                      scope="col" 
                      className="px-6 py-3 text-end text-xs font-medium text-white uppercase dark:text-neutral-500"
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                {isLoading ? (
                      <tr>
                        <td colSpan="5" className="text-center py-4 text-white">
                          جاري التحميل...
                        </td>
                      </tr>
                  ):
                  isError ? (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-red-500">
                        {error.message}
                      </td>
                    </tr>
                  ):
                  
                  filteredProfessors.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-white">
                        لا توجد نتائج
                      </td>
                    </tr> ) : (
                      filteredProfessors.map((professor) => (
                        <Fragment key={professor.id}>
                        <tr
                          key={professor.id}
                          className="hover:bg-black dark:hover:bg-neutral-700"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white dark:text-red-500">
                            {professor.name}
                          </td>
                        
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white dark:text-red-500">
  {/* استبدال الكود القديم بالكود الجديد */}
  {Object.entries(dayMap)
          .filter(([_, key]) => professor[key])
          .map(([day]) => day)
          .join(", ") || "غير متاح"}
</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white dark:text-red-500">
                            📚 عدد المواد المسندة:{" "}
                            {professor.numberAssignedCourses}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
        <Button
         onClick={() => setSelectedProfessor(prev => 
          prev?.id === professor.id ? null : professor
        )}
          variant="gradient"
          size="sm"
          className="bg-blue-600 hover:bg-blue-700"
        >
          {selectedProfessor?.id === professor.id ? "إغلاق المواد" : "إدارة المواد"}
        </Button>
      </td>
                          <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                            <button
                              type="button"
                              onClick={() => handleOpen(professor)}
                              className="inline-flex items-center gap-x-2 text-lg font-semibold rounded-lg border border-transparent text-blue-500  hover:text-blue-800 focus:outline-hidden focus:text-blue-800 disabled:opacity-50 disabled:pointer-events-none dark:text-blue-500 dark:hover:text-blue-400 dark:focus:text-blue-400"
                            >
                              Edit
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                            <button
                              type="button"
                              className="inline-flex items-center gap-x-2 text-lg font-semibold rounded-lg border border-transparent text-red-600 hover:text-blue-800 focus:outline-hidden focus:text-blue-800 disabled:opacity-50 disabled:pointer-events-none dark:text-blue-500 dark:hover:text-blue-400 dark:focus:text-blue-400"
                              onClick={() => handleDelete(professor.id)}
                              >
                              Delete
                            </button>
                          </td>
                          
                        </tr>
                        {selectedProfessor?.id === professor.id && (
      <tr>
        <td colSpan={5} className="p-4 bg-gray-100">
          <ProfessorCoursesManager professorId={professor.id} />
        </td>
      </tr>
    )}
    </Fragment>
                        
                        ))
                    )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
    </div>
   
    </div>
    
    </>
};

export default GetProfessors;
