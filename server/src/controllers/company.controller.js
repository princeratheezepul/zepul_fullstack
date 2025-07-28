import { Company } from "../models/company.model.js";

export const createCompany = async (req, res) => {
     const { domain, companyName, location, employeeNumber, aboutSection, companyType, directorName, founderName, internalNotes, description, website, userId, adminId } = req.body;
        try{
            let company = await Company.findOne({ name: companyName });
        if (company) {
            return res.status(400).json({
                message: "You can't register same company.",
                success: false
            })
        };
        company = await Company.create({
            name: companyName,
            domain,
            location,
            employeeNumber,
            aboutSection,
            companyType,
            directorName,
            founderName,
            internalNotes,
            description,
            website,
            userId,
            adminId
        });

        return res.status(201).json({
            message: "Company registered successfully.",
            company,
            success: true
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}


export const getAllCompanies = async (req, res) => {
    try {
        const companies = await Company.find()
      .populate("assignedTo.managerId", "fullname username email")
      .populate("assignedManagers", "fullname username email");
      // console.log("companies",companies)
        return res.status(200).json({
            message: "Companies fetched successfully.",
            companies,
            success: true
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const updateCompany = async (req, res) => {
    try {
        const { domain, companyName, location, employeeNumber, aboutSection, companyType, directorName, founderName, internalNotes, description, website, userId, adminId } = req.body;
        const companyId = req.params.id;    
        const company = await Company.findByIdAndUpdate(companyId, {
            name: companyName,
            domain,
            location,
            employeeNumber,
            aboutSection,
            companyType,
            directorName,
            founderName,
            internalNotes,
            description,
            website,
            userId,
            adminId
        }, { new: true });  
        return res.status(200).json({
            message: "Company updated successfully.",
            company,
            success: true
        })
        } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error", error: error.message });
        }
    }
export const deleteCompany = async (req, res) => {
    try {
        const companyId = req.params.id;
        const company = await Company.findByIdAndDelete(companyId);
        return res.status(200).json({
            message: "Company deleted successfully.",
            company,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

export const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;

    const company = await Company.findById(id); // no populate

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    console.log(company);
    res.status(200).json({ company });
  } catch (error) {
    console.error("Error fetching company by ID:", error);
    res.status(500).json({ message: "Server error" });
  }
};
